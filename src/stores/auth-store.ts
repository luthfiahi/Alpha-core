import { create } from 'zustand'
import { useTraderStore } from './index'

// ========================================
// Auth Store
// Manages authentication state via Zustand
// ========================================

interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  clearUser: () => {
    useTraderStore.getState().clearTrader()
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  setLoading: (loading) =>
    set({ isLoading: loading }),
}))
