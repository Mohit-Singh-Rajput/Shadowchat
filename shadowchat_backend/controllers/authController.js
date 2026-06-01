const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { generateSessionId } = require('../utils/encryption');

const adjectives = ['Shadow', 'Ghost', 'Phantom', 'Silent', 'Stealth', 'Cipher', 'Mystic', 'Covert', 'Veiled', 'Anon'];
const nouns = ['Fox', 'Wolf', 'Hawk', 'Raven', 'Lynx', 'Viper', 'Falcon', 'Panther', 'Cobra', 'Eagle'];

const generateRandomUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const publicUser = (user) => ({
  _id: user.id,
  username: user.username,
  sessionId: user.sessionId,
  isOnline: user.isOnline,
  theme: user.theme,
  defaultDestructTime: user.defaultDestructTime,
});

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const finalUsername = username || generateRandomUsername();

    const existingUser = await prisma.user.findUnique({ where: { username: finalUsername } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const sessionId = generateSessionId();
    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username: finalUsername,
        password: hashed,
        sessionId,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const sessionId = generateSessionId();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, sessionId },
    });

    const token = generateToken(updated.id);

    res.json({
      success: true,
      token,
      user: publicUser(updated),
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        publicKey: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        sessionId: true,
        defaultDestructTime: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ success: true, user: { ...user, _id: user.id } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { isOnline: false, lastSeen: new Date() },
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const suggestUsername = (req, res) => {
  res.json({ success: true, username: generateRandomUsername() });
};

const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { theme, defaultDestructTime } = req.body;
    const data = {};
    if (theme !== undefined) data.theme = theme;
    if (defaultDestructTime !== undefined) data.defaultDestructTime = defaultDestructTime;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    res.json({ success: true, user: { ...user, _id: user.id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout, suggestUsername, deleteAccount, updateSettings };
