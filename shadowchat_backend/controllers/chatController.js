const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const { scheduleDestruct } = require('../utils/selfDestruct');

const participantSelect = {
  id: true,
  username: true,
  isOnline: true,
  lastSeen: true,
};

const serializeRoom = (room) => ({
  _id: room.id,
  roomId: room.roomId,
  name: room.name,
  isPrivate: room.isPrivate,
  lastMessage: room.lastMessage,
  lastMessageAt: room.lastMessageAt,
  createdBy: room.createdById,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
  participants: (room.participants || []).map((p) => ({
    _id: p.id,
    username: p.username,
    isOnline: p.isOnline,
    lastSeen: p.lastSeen,
  })),
});

const getOrCreateRoom = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId || receiverId === senderId) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let room = await prisma.chatRoom.findFirst({
      where: {
        isPrivate: true,
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: receiverId } } },
        ],
      },
      include: { participants: { select: participantSelect } },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          roomId: crypto.randomUUID(),
          isPrivate: true,
          createdById: senderId,
          participants: { connect: [{ id: senderId }, { id: receiverId }] },
        },
        include: { participants: { select: participantSelect } },
      });
    }

    res.json({ success: true, room: serializeRoom(room) });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 50;

    const room = await prisma.chatRoom.findUnique({
      where: { roomId },
      include: { participants: { select: { id: true } } },
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const isParticipant = room.participants.some((p) => p.id === req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId,
        isDestructed: false,
        OR: [{ destructAt: { gt: new Date() } }, { destructAt: null }],
      },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
    });

    const decryptedMessages = messages.map((msg) => ({
      _id: msg.id,
      sender: { _id: msg.sender.id, username: msg.sender.username },
      roomId: msg.roomId,
      message: decryptMessage(msg.encryptedMessage, msg.iv),
      selfDestructTime: msg.selfDestructTime,
      isRead: msg.isRead,
      readAt: msg.readAt,
      destructAt: msg.destructAt,
      messageType: msg.messageType,
      createdAt: msg.createdAt,
    }));

    res.json({ success: true, messages: decryptedMessages.reverse() });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { roomId, message, selfDestructTime = 0 } = req.body;

    const room = await prisma.chatRoom.findUnique({
      where: { roomId },
      include: { participants: { select: { id: true } } },
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const isParticipant = room.participants.some((p) => p.id === req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { encryptedMessage, iv } = encryptMessage(message);
    const receiver = room.participants.find((p) => p.id !== req.user.id);

    const newMessage = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: receiver ? receiver.id : null,
        roomId,
        encryptedMessage,
        iv,
        selfDestructTime,
      },
      include: { sender: { select: { id: true, username: true } } },
    });

    if (selfDestructTime > 0) {
      await scheduleDestruct(newMessage.id, selfDestructTime);
    }

    await prisma.chatRoom.update({
      where: { roomId },
      data: { lastMessage: '🔒 Encrypted message', lastMessageAt: new Date() },
    });

    res.status(201).json({
      success: true,
      message: {
        _id: newMessage.id,
        sender: { _id: newMessage.sender.id, username: newMessage.sender.username },
        roomId: newMessage.roomId,
        message,
        selfDestructTime: newMessage.selfDestructTime,
        isRead: newMessage.isRead,
        destructAt: newMessage.destructAt,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: { participants: { some: { id: req.user.id } } },
      include: { participants: { select: participantSelect } },
      orderBy: { lastMessageAt: 'desc' },
    });

    res.json({ success: true, rooms: rooms.map(serializeRoom) });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, username: true, isOnline: true, lastSeen: true },
      orderBy: [{ isOnline: 'desc' }, { username: 'asc' }],
    });

    res.json({
      success: true,
      users: users.map((u) => ({ _id: u.id, username: u.username, isOnline: u.isOnline, lastSeen: u.lastSeen })),
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const msg = await prisma.message.findUnique({ where: { id: req.params.messageId } });
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (msg.senderId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.message.delete({ where: { id: req.params.messageId } });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        username: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, username: true, isOnline: true, lastSeen: true },
      take: 10,
    });

    res.json({
      success: true,
      users: users.map((u) => ({ _id: u.id, username: u.username, isOnline: u.isOnline, lastSeen: u.lastSeen })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateRoom,
  getMessages,
  sendMessage,
  getUserRooms,
  getUsers,
  deleteMessage,
  searchUsers,
};
