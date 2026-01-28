import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from './types';

// Socket instance
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let isInitializing = false;

// Initialize socket connection
export function initSocket() {
  if (socket && socket.connected) {
    return socket;
  }

  if (isInitializing) {
    return socket;
  }

  if (!socket) {
    isInitializing = true;
    console.log('Initializing socket connection...');

    socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      upgrade: true,
      rememberUpgrade: true,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.io server with ID:', socket?.id);
      isInitializing = false;
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.io server. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      isInitializing = false;
    });

    socket.io.on('error', (error) => {
      console.error('🔴 Socket.io error:', error);
    });

    socket.io.on('reconnect', (attempt) => {
      console.log('🔄 Reconnected after', attempt, 'attempts');
    });
  }

  return socket;
}

// Get the current socket instance
export function getSocket() {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

// Disconnect socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
