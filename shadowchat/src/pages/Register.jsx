import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const suggestUsername = async () => {
    setSuggestLoading(true);
    try {
      const { data } = await authAPI.suggestUsername();
      setUsername(data.username);
    } catch {
      toast.error('Could not generate username');
    } finally {
      setSuggestLoading(false);
    }
  };

  useEffect(() => {
    suggestUsername();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), password);
      toast.success(`Account created! Welcome, ${username} 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🔒</span>
            <span className="text-2xl font-bold gradient-text">Shadow Chat</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">Create your anonymous identity</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Join the Shadows</h2>
          <p className="text-gray-400 text-sm mb-6">No email. No phone. Just a username.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Username
                <span className="text-pink-400 text-xs ml-1">(auto-generated)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ShadowFox2847"
                  className="input-field"
                  minLength={3}
                  maxLength={20}
                />
                <motion.button
                  type="button"
                  onClick={suggestUsername}
                  disabled={suggestLoading}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-pink-100 text-pink-500 rounded-xl hover:bg-pink-200 transition-colors text-lg flex-shrink-0"
                  title="Generate random username"
                >
                  {suggestLoading ? '⏳' : '🎲'}
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500 transition-colors"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="input-field"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                '👤 Create Anonymous Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-500 font-medium hover:text-pink-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
            <p className="text-xs text-pink-400 text-center">
              🛡️ We never store your IP, location, or device info.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
