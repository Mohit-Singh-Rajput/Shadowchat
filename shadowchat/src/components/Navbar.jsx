import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out securely');
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-pink-100 px-6 py-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          <span className="text-xl font-bold gradient-text">Shadow Chat</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm text-gray-600 font-medium">{user.username}</span>
              </div>
              <Link to="/settings" className="btn-ghost text-sm">Settings</Link>
              <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
