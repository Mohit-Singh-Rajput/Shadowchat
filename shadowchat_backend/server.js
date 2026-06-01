const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
// Input sanitization helper
const sanitizeInput = (req, res, next) => {
  // Strip any $ or . from string values to prevent injection
  const sanitize = (obj) => {
    if (typeof obj === 'string') return obj.replace(/[<>]/g, '');
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((k) => { obj[k] = sanitize(obj[k]); });
    }
    return obj;
  };
  if (req.body) req.body = sanitize(req.body);
  next();
};

dotenv.config();

const { connectDB } = require('./config/prisma');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const socketHandler = require('./sockets/socketHandler');
const { cleanupExpiredMessages } = require('./utils/selfDestruct');

// Connect to Postgres via Prisma
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(sanitizeInput);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Shadow Chat API is running 🔒', timestamp: new Date() });
});

// Socket handler
socketHandler(io);

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Cleanup expired messages every 5 minutes
setInterval(cleanupExpiredMessages, 5 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Shadow Chat Server running on port ${PORT}`);
  console.log(`🔒 Security features: Helmet, Rate Limiting`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
});
