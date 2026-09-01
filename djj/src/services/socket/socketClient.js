import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:3000';

let socketInstance = null;

/**
 * Singleton Socket.IO Client Manager for Frontend
 */
export const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token,
      },
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Real-Time Event Gateway:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      if (reason === 'io server disconnect' || reason === 'transport close') {
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', () => {
      // Quiet background reconnect
    });
  } else if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

/**
 * Join an Event Room for real-time live availability
 */
export const joinEventRoom = (eventId) => {
  const socket = getSocket();
  if (socket && eventId) {
    socket.emit('join:event', eventId);
  }
};

/**
 * Leave an Event Room
 */
export const leaveEventRoom = (eventId) => {
  const socket = getSocket();
  if (socket && eventId) {
    socket.emit('leave:event', eventId);
  }
};

/**
 * Join a Section Room for live seat map updates
 */
export const joinSectionRoom = (sectionId) => {
  const socket = getSocket();
  if (socket && sectionId) {
    socket.emit('join:section', sectionId);
  }
};

/**
 * Leave a Section Room
 */
export const leaveSectionRoom = (sectionId) => {
  const socket = getSocket();
  if (socket && sectionId) {
    socket.emit('leave:section', sectionId);
  }
};
