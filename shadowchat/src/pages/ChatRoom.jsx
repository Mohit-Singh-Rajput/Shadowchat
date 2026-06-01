import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import MessageBubble from '../components/MessageBubble';
import ChatBox from '../components/ChatBox';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const DESTRUCT_OPTIONS = [
  { label: 'No timer', value: 0 },
  { label: '10 sec', value: 10 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
];

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [destructTime, setDestructTime] = useState(0);
  const [otherUser, setOtherUser] = useState(null);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [destructingIds, setDestructingIds] = useState(new Set());

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await chatAPI.getMessages(roomId);
        setMessages(data.messages);

        // Get room info to find other user
        const roomsRes = await chatAPI.getRooms();
        const room = roomsRes.data.rooms.find((r) => r.roomId === roomId);
        if (room) {
          const other = room.participants?.find((p) => p._id !== user?._id);
          setOtherUser(other);
          setIsOtherOnline(other?.isOnline || false);
        }
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [roomId, user]);

  // Socket setup
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('room:join', roomId);
    });

    socket.on('message:received', (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Mark as read if from other user
      if (msg.sender._id !== user?._id) {
        socket.emit('message:read', { messageId: msg._id, roomId });
      }
    });

    socket.on('message:destructed', ({ messageId }) => {
      setDestructingIds((prev) => new Set([...prev, messageId]));
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        setDestructingIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }, 800);
    });

    socket.on('message:destruct_countdown', ({ messageId, seconds }) => {
      toast(`💣 Message self-destructs in ${seconds}s`, { icon: '⏱️', duration: seconds * 1000 });
    });

    socket.on('typing:start', ({ userId: uid, username }) => {
      setTypingUsers((prev) => (prev.some((u) => u.userId === uid) ? prev : [...prev, { userId: uid, username }]));
    });

    socket.on('typing:stop', ({ userId: uid }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== uid));
    });

    socket.on('user:online', ({ userId: uid }) => {
      if (otherUser && uid === otherUser._id) setIsOtherOnline(true);
    });

    socket.on('user:offline', ({ userId: uid }) => {
      if (otherUser && uid === otherUser._id) setIsOtherOnline(false);
    });

    socket.on('message:read_receipt', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isRead: true } : m))
      );
    });

    return () => {
      socket.emit('room:leave', roomId);
      socket.disconnect();
    };
  }, [token, roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !socketRef.current) return;
      socketRef.current.emit('message:send', {
        roomId,
        message: text.trim(),
        selfDestructTime: destructTime,
      });
      socketRef.current.emit('typing:stop', { roomId });
    },
    [roomId, destructTime]
  );

  const handleTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing:start', { roomId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { roomId });
    }, 2000);
  }, [roomId]);

  const handleDeleteMessage = useCallback(
    (messageId) => {
      socketRef.current?.emit('message:delete', { messageId, roomId });
    },
    [roomId]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-pink-400 text-sm">Loading secure chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex flex-col">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mx-4 mt-4 px-4 py-3 flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-pink-400 hover:text-pink-600 transition-colors p-1"
        >
          ←
        </button>
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {otherUser?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 ${isOtherOnline ? 'online-dot' : 'offline-dot'}`} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{otherUser?.username || 'Unknown'}</p>
          <p className="text-xs text-gray-400">
            {isOtherOnline ? '🟢 Online' : '⚫ Offline'} · 🔒 End-to-End Encrypted
          </p>
        </div>

        {/* Destruct timer selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">💣</span>
          <select
            value={destructTime}
            onChange={(e) => setDestructTime(Number(e.target.value))}
            className="text-xs bg-pink-50 border border-pink-200 text-pink-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-300"
          >
            {DESTRUCT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <p className="text-4xl mb-3">🔒</p>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Messages are end-to-end encrypted</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
              isDestructing={destructingIds.has(msg._id)}
              onDelete={handleDeleteMessage}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 px-2"
            >
              <div className="message-bubble-received flex items-center gap-1.5 py-3 px-4">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span className="text-xs text-gray-400">{typingUsers[0].username} is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="px-4 pb-4">
        <ChatBox onSend={sendMessage} onTyping={handleTyping} destructTime={destructTime} />
      </div>
    </div>
  );
}
