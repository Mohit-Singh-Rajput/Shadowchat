import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function QRGenerator({ value, username, roomId }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = roomId
    ? `${window.location.origin}/chat/${roomId}`
    : value || window.location.origin;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="text-center">
        <h3 className="font-bold text-gray-800 text-lg">Share Secure Chat</h3>
        {username && (
          <p className="text-sm text-gray-400 mt-1">Invite someone to chat with <span className="text-pink-500 font-medium">{username}</span></p>
        )}
      </div>

      {/* QR Code */}
      <div className="p-4 bg-white rounded-2xl shadow-pink-sm border border-pink-100">
        <QRCodeSVG
          value={shareUrl}
          size={180}
          bgColor="#ffffff"
          fgColor="#EC407A"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* URL display */}
      <div className="w-full bg-pink-50 rounded-xl p-3 border border-pink-100">
        <p className="text-xs text-gray-400 mb-1">Invite Link</p>
        <p className="text-sm text-pink-500 font-mono truncate">{shareUrl}</p>
      </div>

      {/* Copy button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={copyLink}
        className="btn-primary w-full text-sm"
      >
        {copied ? '✅ Copied!' : '📋 Copy Invite Link'}
      </motion.button>

      <p className="text-xs text-gray-400 text-center">
        🔒 Share this QR code to invite someone to a secure chat session
      </p>
    </motion.div>
  );
}
