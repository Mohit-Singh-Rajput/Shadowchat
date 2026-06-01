import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

const DESTRUCT_OPTIONS = [
  { label: 'No auto-destruct', value: 0 },
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
];

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [destructTime, setDestructTime] = useState(user?.defaultDestructTime || 0);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateSettings({ defaultDestructTime: destructTime });
      updateUser(data.user);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out securely');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your privacy and preferences</p>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-4"
        >
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>👤</span> Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">{user?.username}</p>
              <p className="text-sm text-gray-400">Anonymous Account</p>
              <p className="text-xs text-pink-400 mt-1">🛡️ Identity protected</p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 mb-4"
        >
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>🔒</span> Privacy Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">IP Address Storage</p>
                <p className="text-xs text-gray-400">Never stored</p>
              </div>
              <span className="text-green-500 text-sm font-medium">✅ Protected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">Location Data</p>
                <p className="text-xs text-gray-400">Never collected</p>
              </div>
              <span className="text-green-500 text-sm font-medium">✅ Protected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">End-to-End Encryption</p>
                <p className="text-xs text-gray-400">AES-256 on all messages</p>
              </div>
              <span className="text-green-500 text-sm font-medium">✅ Active</span>
            </div>
          </div>
        </motion.div>

        {/* Message Timer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-4"
        >
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>💣</span> Default Self-Destruct Timer
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Set a default timer for all your messages. Can be overridden per chat.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {DESTRUCT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDestructTime(opt.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                  destructTime === opt.value
                    ? 'bg-pink-500 text-white border-pink-500 shadow-pink-sm'
                    : 'bg-white text-gray-600 border-pink-100 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              '💾 Save Settings'
            )}
          </motion.button>
        </motion.div>

        {/* Session */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 mb-4"
        >
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>🔐</span> Session
          </h2>
          <div className="p-3 bg-pink-50 rounded-xl mb-4">
            <p className="text-xs text-gray-500">Session ID</p>
            <p className="text-sm font-mono text-pink-500 truncate">{user?.sessionId || 'N/A'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary w-full text-sm"
          >
            🚪 Logout Securely
          </button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border border-red-100"
        >
          <h2 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-4 bg-red-50 text-red-400 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
            >
              🗑️ Delete Account Permanently
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-400 font-medium">
                Are you sure? This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
