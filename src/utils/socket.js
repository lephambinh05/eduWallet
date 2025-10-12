import { io } from 'socket.io-client';

// Socket.IO connection to backend
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to EduWallet backend:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from EduWallet backend:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Authentication event
socket.on('authenticated', (data) => {
  console.log('Socket authenticated:', data);
});

socket.on('unauthorized', (error) => {
  console.error('Socket authentication failed:', error);
});

// EduWallet specific events
socket.on('learnpass-updated', (data) => {
  console.log('LearnPass updated:', data);
});

socket.on('certificate-received', (data) => {
  console.log('Certificate received:', data);
});

socket.on('purchase-notification', (data) => {
  console.log('Purchase notification:', data);
});

socket.on('reward-received', (data) => {
  console.log('Reward received:', data);
});

// Legacy events for backward compatibility
socket.on('receive-money', (data) => {
  console.log('Money received:', data);
});

socket.on('transfer-success', (data) => {
  console.log('Transfer success:', data);
});

// Helper functions
export const connectSocket = (user) => {
  if (user && user.id) {
    socket.auth = {
      userId: user.id,
      token: localStorage.getItem('accessToken')
    };
    socket.connect();
    
    // Join user's personal room
    socket.emit('join-user-room', user.id);
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const emitUserOnline = (userId) => {
  if (socket.connected) {
    socket.emit('user-online', userId);
  }
};

export const emitLearnPassUpdate = (data) => {
  if (socket.connected) {
    socket.emit('learnpass-update', data);
  }
};

export const emitCertificateIssued = (data) => {
  if (socket.connected) {
    socket.emit('certificate-issued', data);
  }
};

export const emitMarketplacePurchase = (data) => {
  if (socket.connected) {
    socket.emit('marketplace-purchase', data);
  }
};

export const emitRewardDistributed = (data) => {
  if (socket.connected) {
    socket.emit('reward-distributed', data);
  }
};

export default socket;