const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');
const { encryptMessage } = require('../utils/encryption');
const { scheduleDestruct, markReadAndDestruct } = require('../utils/selfDestruct');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true },
      });
      if (!user) return next(new Error('User not found'));

      socket.user = { ...user, _id: user.id };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    onlineUsers.set(userId, socket.id);

    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true },
    });

    io.emit('user:online', { userId, username: socket.user.username });
    socket.emit('users:online_list', Array.from(onlineUsers.keys()));

    socket.on('room:join', (roomId) => {
      socket.join(roomId);
      console.log(`📥 ${socket.user.username} joined room: ${roomId}`);
    });

    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
      console.log(`📤 ${socket.user.username} left room: ${roomId}`);
    });

    socket.on('message:send', async (data) => {
      try {
        const { roomId, message, selfDestructTime = 0 } = data;

        const { encryptedMessage, iv } = encryptMessage(message);

        const newMessage = await prisma.message.create({
          data: {
            senderId: userId,
            roomId,
            encryptedMessage,
            iv,
            selfDestructTime,
          },
        });

        if (selfDestructTime > 0) {
          await scheduleDestruct(newMessage.id, selfDestructTime);

          setTimeout(() => {
            io.to(roomId).emit('message:destructed', { messageId: newMessage.id });
          }, selfDestructTime * 1000);
        }

        const messagePayload = {
          _id: newMessage.id,
          sender: {
            _id: userId,
            username: socket.user.username,
          },
          roomId,
          message,
          selfDestructTime,
          isRead: false,
          destructAt: newMessage.destructAt,
          createdAt: newMessage.createdAt,
        };

        io.to(roomId).emit('message:received', messagePayload);

        try {
          const room = await prisma.chatRoom.findUnique({
            where: { roomId },
            include: { participants: { select: { id: true } } },
          });
          if (room) {
            room.participants.forEach((participant) => {
              if (participant.id !== userId) {
                const recipientSocketId = onlineUsers.get(participant.id);
                if (recipientSocketId) {
                  io.to(recipientSocketId).emit('message:received', messagePayload);
                }
              }
            });
          }
        } catch (err) {
          console.error('Participant notify error:', err.message);
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
        console.error('Socket send error:', err.message);
      }
    });

    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', {
        userId,
        username: socket.user.username,
      });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { userId });
    });

    socket.on('message:read', async ({ messageId, roomId }) => {
      await markReadAndDestruct(messageId, io, roomId);
      socket.to(roomId).emit('message:read_receipt', { messageId });
    });

    socket.on('message:delete', async ({ messageId, roomId }) => {
      try {
        const msg = await prisma.message.findUnique({ where: { id: messageId } });
        if (msg && msg.senderId === userId) {
          await prisma.message.delete({ where: { id: messageId } });
          io.to(roomId).emit('message:destructed', { messageId });
        }
      } catch (err) {
        console.error('Delete error:', err.message);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
      onlineUsers.delete(userId);

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeen: new Date() },
        });
      } catch (err) {
        console.error('Disconnect update error:', err.message);
      }

      io.emit('user:offline', { userId, username: socket.user.username });
    });
  });
};

module.exports = socketHandler;
