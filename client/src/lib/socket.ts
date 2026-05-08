// ============================================
// Socket.IO Client — Real-time Connection
// ============================================

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(userId: string): Socket {
  if (socket?.connected) return socket;

  const url = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  socket = io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    socket?.emit('join', userId);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinProject(projectId: string) {
  socket?.emit('join-project', projectId);
}

export function leaveProject(projectId: string) {
  socket?.emit('leave-project', projectId);
}

export function joinChannel(channelId: string) {
  socket?.emit('join-channel', channelId);
}

export function emitTypingStart(channelId: string, userId: string, userName: string) {
  socket?.emit('typing:start', { channelId, userId, userName });
}

export function emitTypingStop(channelId: string, userId: string) {
  socket?.emit('typing:stop', { channelId, userId });
}

export default { getSocket, connectSocket, disconnectSocket, joinProject, leaveProject, joinChannel };
