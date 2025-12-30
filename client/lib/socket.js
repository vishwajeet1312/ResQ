import { io } from 'socket.io-client';

// Socket.IO connects to root, not /api
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      // Join user-specific room
      if (userId) {
        socket.emit('join-room', `user-${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initializeSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

// Event listeners
export const onSOSBroadcast = (callback) => {
  if (socket) socket.on('sos-broadcast', callback);
};

export const onSOSAcknowledged = (callback) => {
  if (socket) socket.on('sos-acknowledged', callback);
};

export const onSOSStatusUpdated = (callback) => {
  if (socket) socket.on('sos-status-updated', callback);
};

export const onNewIncident = (callback) => {
  if (socket) socket.on('new-incident', callback);
};

export const onIncidentUpdated = (callback) => {
  if (socket) socket.on('incident-updated', callback);
};

export const onResourceAdded = (callback) => {
  if (socket) socket.on('resource-added', callback);
};

export const onResourceUpdated = (callback) => {
  if (socket) socket.on('resource-updated', callback);
};

export const onNewTriage = (callback) => {
  if (socket) socket.on('new-triage', callback);
};

export const onTriageStatusUpdated = (callback) => {
  if (socket) socket.on('triage-status-updated', callback);
};

export const onNewMission = (callback) => {
  if (socket) socket.on('new-mission', callback);
};

export const onMissionUpdated = (callback) => {
  if (socket) socket.on('mission-updated', callback);
};

export const onNewNotification = (callback) => {
  if (socket) socket.on('new-notification', callback);
};

export const joinSector = (sectorId) => {
  if (socket) socket.emit('join-sector', sectorId);
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  onSOSBroadcast,
  onSOSAcknowledged,
  onSOSStatusUpdated,
  onNewIncident,
  onIncidentUpdated,
  onResourceAdded,
  onResourceUpdated,
  onNewTriage,
  onTriageStatusUpdated,
  onNewMission,
  onMissionUpdated,
  onNewNotification,
  joinSector,
};
