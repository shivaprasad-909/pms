// ============================================
// Socket Store — Real-time State Management
// ============================================

import { create } from 'zustand';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

interface SocketState {
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, { userId: string; userName: string }[]>;
  connect: (userId: string) => void;
  disconnect: () => void;
  isUserOnline: (userId: string) => boolean;
  getTypingUsers: (channelId: string) => { userId: string; userName: string }[];
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  onlineUsers: new Set<string>(),
  typingUsers: new Map(),

  connect: (userId: string) => {
    const socket = connectSocket(userId);

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));

    socket.on('presence:update', ({ userId: uid, status }: { userId: string; status: string }) => {
      set(state => {
        const users = new Set(state.onlineUsers);
        status === 'online' ? users.add(uid) : users.delete(uid);
        return { onlineUsers: users };
      });
    });

    socket.on('typing:start', ({ channelId, userId: uid, userName }: any) => {
      set(state => {
        const map = new Map(state.typingUsers);
        const list = map.get(channelId) || [];
        if (!list.some(t => t.userId === uid)) {
          map.set(channelId, [...list, { userId: uid, userName }]);
        }
        return { typingUsers: map };
      });
    });

    socket.on('typing:stop', ({ channelId, userId: uid }: any) => {
      set(state => {
        const map = new Map(state.typingUsers);
        const list = (map.get(channelId) || []).filter(t => t.userId !== uid);
        map.set(channelId, list);
        return { typingUsers: map };
      });
    });

    // Listen for live updates
    socket.on('task:updated', () => {
      window.dispatchEvent(new CustomEvent('pms:task-updated'));
    });
    socket.on('task:created', () => {
      window.dispatchEvent(new CustomEvent('pms:task-updated'));
    });
    socket.on('notification:created', () => {
      window.dispatchEvent(new CustomEvent('pms:notification'));
    });
    socket.on('message:created', () => {
      window.dispatchEvent(new CustomEvent('pms:message'));
    });
  },

  disconnect: () => {
    disconnectSocket();
    set({ isConnected: false, onlineUsers: new Set() });
  },

  isUserOnline: (userId: string) => get().onlineUsers.has(userId),
  getTypingUsers: (channelId: string) => get().typingUsers.get(channelId) || [],
}));
