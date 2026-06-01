import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: '💬', label: 'Chats' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out securely');
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-16 md:w-56 min-h-screen bg-white/60 backdrop-blur-md border-r border-pink-100 flex flex-col py-4 px-2 md:px-4 flex-shrink-0"
    >
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 mb-8 px-2">
        <span className="text-2xl">🔒</span>
        <span className="hidden md:block text-lg font-bold gradient-text">Shadow Chat</span>
      </Link>

      {/* User info */}
      <div className="hidden md:flex items-center gap-3 mb-6 p-3 bg-pink-50 rounded-xl">
        <div className="w-9 h-9 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-700 truncate">{user?.username}</p>
          <p className="text-xs text-green-500">● Online</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:block text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="sidebar-item text-red-400 hover:text-red-500 hover:bg-red-50 mt-2"
      >
        <span className="text-xl">🚪</span>
        <span className="hidden md:block text-sm">Logout</span>
      </button>
    </motion.aside>
  );
}
