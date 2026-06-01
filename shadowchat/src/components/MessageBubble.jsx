import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MessageBubble({ message, isOwn, isDestructing, onDelete }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [showActions, setShowActions] = useState(false);

  // Countdown timer for self-destruct
  useEffect(() => {
    if (!message.destructAt) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(message.destructAt) - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [message.destructAt]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={
        isDestructing
          ? { opacity: 0, scale: 0.7, filter: 'blur(8px)', transition: { duration: 0.8 } }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)', transition: { duration: 0.5 } }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs sm:max-w-sm`}>
        {/* Sender name (for received messages) */}
        {!isOwn && (
          <p className="text-xs text-gray-400 mb-1 px-1">
            {message.sender?.username || 'Unknown'}
          </p>
        )}

        <div className="relative">
          {/* Message bubble */}
          <div className={isOwn ? 'message-bubble-sent' : 'message-bubble-received'}>
            <p className="text-sm leading-relaxed break-words">{message.message}</p>

            {/* Self-destruct indicator */}
            {(message.selfDestructTime > 0 || timeLeft !== null) && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs ${isOwn ? 'text-pink-100' : 'text-pink-400'}`}>
                <span>💣</span>
                <span>
                  {timeLeft !== null
                    ? `${timeLeft}s`
                    : `${message.selfDestructTime}s`}
                </span>
              </div>
            )}
          </div>

          {/* Delete button (own messages) */}
          {isOwn && showActions && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onDelete(message._id)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-100 text-red-400 rounded-full flex items-center justify-center text-xs hover:bg-red-200 transition-colors"
              title="Delete message"
            >
              🗑
            </motion.button>
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-300">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="text-xs">
              {message.isRead ? (
                <span className="text-pink-400" title="Read">✓✓</span>
              ) : (
                <span className="text-gray-300" title="Sent">✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
