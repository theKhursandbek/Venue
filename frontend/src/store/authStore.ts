import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  requiresRegistration: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  login: (
    access: string,
    refresh: string,
    user: User,
    requiresRegistration?: boolean,
  ) => void;
  markRegistrationCompleted: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      requiresRegistration: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),

      setUser: (user) => set({ user }),

      login: (access, refresh, user, requiresRegistration = false) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          user,
          isAuthenticated: true,
          requiresRegistration,
        }),

      markRegistrationCompleted: (user) =>
        set({
          user,
          requiresRegistration: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          requiresRegistration: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        requiresRegistration: state.requiresRegistration,
      }),
    }
  )
);
