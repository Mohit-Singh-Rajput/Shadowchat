const express = require('express');
const router = express.Router();
const {
  getOrCreateRoom,
  getMessages,
  sendMessage,
  getUserRooms,
  getUsers,
  deleteMessage,
  searchUsers,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/room', protect, getOrCreateRoom);
router.get('/rooms', protect, getUserRooms);
router.get('/messages/:roomId', protect, getMessages);
router.post('/message', protect, sendMessage);
router.delete('/message/:messageId', protect, deleteMessage);
router.get('/users', protect, getUsers);
router.get('/search', protect, searchUsers);

module.exports = router;
