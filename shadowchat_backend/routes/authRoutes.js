const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  suggestUsername,
  deleteAccount,
  updateSettings,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/suggest-username', suggestUsername);
router.delete('/delete', protect, deleteAccount);
router.put('/settings', protect, updateSettings);

module.exports = router;
