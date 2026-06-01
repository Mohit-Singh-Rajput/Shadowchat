import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '🔒', title: 'End-to-End Encrypted', desc: 'AES-256 encryption on every message. Only you and your recipient can read them.' },
  { icon: '💣', title: 'Self-Destruct Messages', desc: 'Set timers from 10 seconds to 5 minutes. Messages vanish automatically.' },
  { icon: '👤', title: 'Anonymous Identity', desc: 'No email, no phone. Random usernames keep your identity hidden.' },
  { icon: '⚡', title: 'Real-Time Chat', desc: 'Instant messaging powered by Socket.io with typing indicators.' },
  { icon: '🛡️', title: 'Zero Metadata', desc: 'We never store your IP, location, or device info.' },
  { icon: '📱', title: 'QR Code Sharing', desc: 'Share secure chat rooms instantly with QR codes.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">🔒</span>
          <span className="text-xl font-bold gradient-text">Shadow Chat</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-pink-200">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            Privacy-First Messaging Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-6 leading-tight">
            Chat in the{' '}
            <span className="gradient-text">Shadows</span>
            <br />Stay Anonymous
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            End-to-end encrypted messaging with self-destruct timers, anonymous identities,
            and zero metadata storage. Your conversations, your rules.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-base px-8 py-4 pink-glow"
              >
                🚀 Start Secure Chat
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-base px-8 py-4"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Floating chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-16 max-w-sm mx-auto"
        >
          <div className="glass-card p-4 text-left">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-pink-100">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">SC</div>
              <div>
                <p className="text-sm font-semibold text-gray-700">ShadowFox2847</p>
                <p className="text-xs text-green-500">● Online</p>
              </div>
              <span className="ml-auto text-xs bg-pink-100 text-pink-500 px-2 py-1 rounded-full">🔒 E2E</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-end">
                <div className="message-bubble-sent text-sm">Hey, this is encrypted! 🔒</div>
              </div>
              <div className="flex justify-start">
                <div className="message-bubble-received text-sm">Only we can read this 👻</div>
              </div>
              <div className="flex justify-end">
                <div className="message-bubble-sent text-sm">
                  💣 Self-destructs in 10s
                  <div className="text-xs opacity-75 mt-1">⏱ 10s</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold text-center text-gray-800 mb-12"
        >
          Why <span className="gradient-text">Shadow Chat</span>?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 cursor-default"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-3xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to chat in the shadows?</h2>
          <p className="text-pink-100 mb-8">No sign-up required. No personal info needed. Just pure, secure messaging.</p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-pink-500 font-bold px-8 py-4 rounded-xl hover:bg-pink-50 transition-all"
            >
              Create Anonymous Account
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-pink-100">
        <p>🔒 Shadow Chat — Your privacy is our priority. No logs. No traces.</p>
      </footer>
    </div>
  );
}
