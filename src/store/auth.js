import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginRequest, refreshRequest, meRequest } from '@/services/auth';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      setAuth: (user, tokens) => {
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        });
      },

      login: async (payload) => {
        const data = await loginRequest(payload);
        set({
          user: data.user,
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          expiresAt: data.tokens.expiresAt,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        });
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        const tokens = await refreshRequest(refreshToken);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        });
        return tokens.accessToken;
      },

      hasRole: (roles) => {
        if (!roles || roles.length === 0) return true;
        const u = get().user;
        return !!u && u.roles.some(r => roles.includes(r));
      },

      fetchMe: async () => {
        const user = await meRequest();
        set({ user });
      },

      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        return Date.now() < expiresAt - 5_000; // 5s buffer
      },
    }),
    {
      name: 'erp-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
