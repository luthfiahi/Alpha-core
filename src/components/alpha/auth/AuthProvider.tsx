'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'

// ========================================
// Auth Context
// ========================================

interface AuthContextValue {
  user: { id: string; email: string; name: string } | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ========================================
// AuthProvider Component
// ========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const initialized = useRef(false)

  // Fetch session on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        } else {
          clearUser()
        }
      } catch {
        clearUser()
      }
    }

    fetchSession()
  }, [setUser, clearUser])

  // Listen for auth state changes via Supabase browser client
  useEffect(() => {
    let mounted = true

    async function setupListener() {
      // Dynamic import to avoid SSR issues
      const { supabase } = await import('@/lib/supabase/client')

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (!mounted) return

        if (event === 'SIGNED_IN') {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Trader',
            })
          }
        } else if (event === 'SIGNED_OUT') {
          clearUser()
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    setupListener()

    return () => {
      mounted = false
    }
  }, [setUser, clearUser])

  // Login with magic link
  const login = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal mengirim magic link' }
      }

      return { success: true, message: data.message }
    } catch {
      return { success: false, error: 'Terjadi kesalahan jaringan' }
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    }
    clearUser()
  }, [clearUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
