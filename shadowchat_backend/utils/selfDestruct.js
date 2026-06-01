const { prisma } = require('../config/prisma');

const safeDelete = async (messageId) => {
  try {
    await prisma.message.delete({ where: { id: messageId } });
    return true;
  } catch (err) {
    // P2025 = record not found (already deleted) — not an error worth logging
    if (err.code !== 'P2025') {
      console.error('Self-destruct delete error:', err.message);
    }
    return false;
  }
};

/**
 * Schedule a message for self-destruction
 */
const scheduleDestruct = async (messageId, seconds) => {
  if (!seconds || seconds <= 0) return;

  const destructAt = new Date(Date.now() + seconds * 1000);

  await prisma.message.update({
    where: { id: messageId },
    data: { destructAt, selfDestructTime: seconds },
  });

  setTimeout(async () => {
    const deleted = await safeDelete(messageId);
    if (deleted) console.log(`🔥 Message ${messageId} self-destructed`);
  }, seconds * 1000);
};

/**
 * Mark message as read and trigger read-based self-destruct
 */
const markReadAndDestruct = async (messageId, io, roomId) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return;

    if (message.selfDestructTime > 0) {
      const destructAt = new Date(Date.now() + message.selfDestructTime * 1000);
      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date(), destructAt },
      });

      io.to(roomId).emit('message:destruct_countdown', {
        messageId,
        seconds: message.selfDestructTime,
      });

      setTimeout(async () => {
        const deleted = await safeDelete(messageId);
        if (deleted) {
          io.to(roomId).emit('message:destructed', { messageId });
          console.log(`🔥 Message ${messageId} self-destructed after read`);
        }
      }, message.selfDestructTime * 1000);
    } else {
      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date() },
      });
    }
  } catch (err) {
    console.error('markReadAndDestruct error:', err.message);
  }
};

/**
 * Clean up expired messages (fallback sweep — runs on an interval from server.js)
 */
const cleanupExpiredMessages = async () => {
  try {
    const result = await prisma.message.deleteMany({
      where: { destructAt: { lte: new Date() } },
    });
    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired messages`);
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

module.exports = { scheduleDestruct, markReadAndDestruct, cleanupExpiredMessages };
