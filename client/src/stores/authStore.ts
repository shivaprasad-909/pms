// ============================================
// Auth Store — Zustand State Management
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  setup: (data: { organizationName: string; email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  
  // Role checks
  isFounder: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isDeveloper: () => boolean;
  hasRole: (...roles: Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      setup: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/setup', data);
          const { user, accessToken, refreshToken } = res.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Setup failed');
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken });
      },

      isFounder: () => get().user?.role === 'FOUNDER',
      isAdmin: () => get().user?.role === 'ADMIN',
      isManager: () => get().user?.role === 'MANAGER',
      isDeveloper: () => get().user?.role === 'DEVELOPER',
      hasRole: (...roles) => {
        const userRole = get().user?.role;
        return userRole ? roles.includes(userRole) : false;
      },
      hasPermission: (permission: string) => {
        const user = get().user as any;
        if (!user) return false;
        if (user.role === 'FOUNDER' || user.role === 'ADMIN') return true; // Admins override
        
        // Hardcoded defaults just in case the backend hasn't updated/restarted yet
        const defaultRolePerms: Record<string, string[]> = {
          MANAGER: ['dashboard.view', 'projects.view', 'projects.create', 'tasks.view', 'tasks.update', 'analytics.view', 'reports.view', 'chat.access', 'teams.manage'],
          DEVELOPER: ['dashboard.view', 'projects.view', 'tasks.view', 'tasks.update', 'chat.access'],
          STAKEHOLDER: ['dashboard.view', 'projects.view', 'reports.view']
        };

        const perms = user.permissions || [ ...(defaultRolePerms[user.role] || []), ...(user.uiPermissions || []) ];
        return Array.isArray(perms) && (perms.includes('*') || perms.includes(permission));
      },
    }),
    {
      name: 'pms-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
