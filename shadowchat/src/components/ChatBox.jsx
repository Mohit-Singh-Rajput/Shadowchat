import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ChatBox({ onSend, onTyping, destructTime }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
  };

  return (
    <div className="glass-card p-3">
      {/* Destruct timer badge */}
      {destructTime > 0 && (
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <span className="text-xs bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full flex items-center gap-1">
            💣 Self-destructs in {destructTime >= 60 ? `${destructTime / 60}min` : `${destructTime}s`}
          </span>
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Screenshot warning */}
        <button
          className="text-pink-300 hover:text-pink-500 transition-colors p-1 flex-shrink-0"
          title="Screenshot protection active"
          onClick={() => alert('⚠️ Screenshot Warning: Taking screenshots of encrypted conversations may violate privacy.')}
        >
          🛡️
        </button>

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type an encrypted message..."
          rows={1}
          className="flex-1 bg-pink-50 border border-pink-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none max-h-32 overflow-y-auto"
          style={{ minHeight: '42px' }}
        />

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-pink-sm hover:shadow-pink-md transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </motion.button>
      </div>

      <p className="text-xs text-gray-300 mt-2 px-1 flex items-center gap-1">
        <span>🔒</span> Messages are end-to-end encrypted · Press Enter to send
      </p>
    </div>
  );
}
