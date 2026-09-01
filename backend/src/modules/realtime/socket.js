import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { REALTIME_EVENTS } from './realtime.events.js';

let io = null;

/**
 * Initialize Socket.IO Server attached to Express HTTP Server
 */
export const initSocket = (httpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingInterval: 25000,
    pingTimeout: 60000,
    connectTimeout: 45000,
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        socket.user = decoded;
      } catch (err) {
        logger.warn(`Socket authentication failed: ${err.message}`);
      }
    }
    next();
  });

  // Client Connection Handler
  io.on('connection', (socket) => {
    logger.info(`⚡ Socket connected: ${socket.id} (User: ${socket.user?.id || 'Guest'})`);

    // Auto-join personal user room if authenticated
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role === 'SUPER_ADMIN') {
        socket.join('admin');
      } else if (socket.user.role === 'EVENT_ORGANIZER') {
        socket.join(`organizer:${socket.user.id}`);
      }
    }

    // Room Subscription Commands
    socket.on('join:event', (eventId) => {
      if (eventId) {
        const roomName = `event:${eventId}`;
        socket.join(roomName);
        socket.emit(REALTIME_EVENTS.ROOM_JOINED, { room: roomName });
      }
    });

    socket.on('leave:event', (eventId) => {
      if (eventId) {
        const roomName = `event:${eventId}`;
        socket.leave(roomName);
        socket.emit(REALTIME_EVENTS.ROOM_LEFT, { room: roomName });
      }
    });

    socket.on('join:section', (sectionId) => {
      if (sectionId) {
        const roomName = `section:${sectionId}`;
        socket.join(roomName);
        socket.emit(REALTIME_EVENTS.ROOM_JOINED, { room: roomName });
      }
    });

    socket.on('leave:section', (sectionId) => {
      if (sectionId) {
        const roomName = `section:${sectionId}`;
        socket.leave(roomName);
        socket.emit(REALTIME_EVENTS.ROOM_LEFT, { room: roomName });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`⚡ Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

/**
 * Get active Socket.IO Server Instance
 */
export const getIO = () => {
  if (!io) {
    logger.warn('Socket.IO is not initialized yet.');
  }
  return io;
};
