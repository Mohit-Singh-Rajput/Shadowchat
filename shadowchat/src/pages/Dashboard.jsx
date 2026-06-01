import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import QRGenerator from '../components/QRGenerator';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const socketRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, roomsRes] = await Promise.all([
        chatAPI.getUsers(),
        chatAPI.getRooms(),
      ]);
      setUsers(usersRes.data.users);
      setRooms(roomsRes.data.rooms);
    } catch {
      toast.error('Failed to load data');
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // When a new message arrives anywhere, refresh rooms list
    socket.on('message:received', (msg) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.roomId === msg.roomId);
        if (exists) {
          // Move room to top and update last message preview
          const updated = prev.map((r) =>
            r.roomId === msg.roomId
              ? { ...r, lastMessage: '🔒 Encrypted message', lastMessageAt: msg.createdAt }
              : r
          );
          // Sort: most recent first
          return [...updated].sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          );
        }
        // New room — re-fetch to get full room data with participants
        chatAPI.getRooms().then((res) => setRooms(res.data.rooms)).catch(() => {});
        return prev;
      });
    });

    // Update online/offline status in users list
    socket.on('user:online', ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline: true } : u))
      );
    });

    socket.on('user:offline', ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isOnline: false, lastSeen: new Date() } : u
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await chatAPI.searchUsers(searchQuery);
        setSearchResults(data.users);
      } catch {}
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openChat = async (userId) => {
    setLoadingRoom(userId);
    try {
      const { data } = await chatAPI.getOrCreateRoom(userId);
      navigate(`/chat/${data.room.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open chat');
    } finally {
      setLoadingRoom(null);
    }
  };

  const openRoom = (roomId) => navigate(`/chat/${roomId}`);

  const getOtherParticipant = (room) =>
    room.participants?.find((p) => p._id !== user?._id);

  const displayUsers = searchQuery ? searchResults : users;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hey, <span className="gradient-text">{user?.username}</span> 👋
              </h1>
              <p className="text-gray-400 text-sm mt-1">Your secure messaging hub</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQR(true)}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
            >
              📱 Share QR
            </motion.button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-10"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin inline-block" />
              </span>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['chats', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-pink-500 text-white shadow-pink-sm'
                  : 'bg-white text-gray-500 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              {tab === 'chats' ? `💬 Recent Chats${rooms.length > 0 ? ` (${rooms.length})` : ''}` : '👥 All Users'}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'chats' ? (
            <motion.div
              key="chats"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {rooms.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-500 font-medium">No chats yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Switch to{' '}
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-pink-500 font-medium underline underline-offset-2"
                    >
                      All Users
                    </button>{' '}
                    tab to start a conversation
                  </p>
                </div>
              ) : (
                rooms.map((room, i) => {
                  const other = getOtherParticipant(room);
                  return (
                    <motion.div
                      key={room._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => openRoom(room.roomId)}
                      className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-pink-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {other?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 ${other?.isOnline ? 'online-dot' : 'offline-dot'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{other?.username || 'Unknown'}</p>
                        <p className="text-sm text-gray-400 truncate">{room.lastMessage || 'Start chatting...'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-300">
                          {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleDateString() : ''}
                        </p>
                        <span className="text-xs bg-pink-100 text-pink-400 px-2 py-0.5 rounded-full mt-1 inline-block">🔒</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {displayUsers.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-gray-500 font-medium">
                    {searchQuery ? 'No users found' : 'No other users yet'}
                  </p>
                  {!searchQuery && (
                    <p className="text-gray-400 text-sm mt-1">
                      Register another account to start chatting
                    </p>
                  )}
                </div>
              ) : (
                displayUsers.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 ${u.isOnline ? 'online-dot' : 'offline-dot'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{u.username}</p>
                      <p className="text-xs text-gray-400">
                        {u.isOnline ? '🟢 Online' : `Last seen ${new Date(u.lastSeen).toLocaleDateString()}`}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openChat(u._id)}
                      disabled={loadingRoom === u._id}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      {loadingRoom === u._id ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        '💬 Chat'
                      )}
                    </motion.button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-sm w-full"
            >
              <QRGenerator value={window.location.origin} username={user?.username} />
              <button
                onClick={() => setShowQR(false)}
                className="btn-secondary w-full mt-4 text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
