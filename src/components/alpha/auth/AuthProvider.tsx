'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase/client'

// ========================================
// Auth Context
// ========================================

interface AuthContextValue {
  user: { id: string; email: string; name: string } | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; debugCode?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
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
// Error message mapping (Indonesian)
// ========================================

const loginErrorMap: Record<string, string> = {
  'Invalid login credentials': 'Email atau password salah',
  'Email not confirmed': 'Email belum diverifikasi. Cek inbox atau spam kamu.',
  'Too many requests': 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.',
  'Invalid API key': 'Konfigurasi API tidak valid. Hubungi admin.',
  'user not found': 'Email atau password salah',
}

const registerErrorMap: Record<string, string> = {
  'User already registered': 'EMAIL_EXISTS',
  'email rate limit exceeded': 'Terlalu banyak permintaan. Tunggu 5-10 menit.',
  'Email rate limit exceeded': 'Terlalu banyak permintaan. Tunggu 5-10 menit.',
}

const forgotErrorMap: Record<string, string> = {
  'email rate limit exceeded': 'Terlalu banyak permintaan email. Tunggu 5-10 menit lalu coba lagi.',
  'Email rate limit exceeded': 'Terlalu banyak permintaan email. Tunggu 5-10 menit lalu coba lagi.',
}

// ========================================
// AuthProvider Component
// ========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const initialized = useRef(false)

  // Check existing session on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function checkSession() {
      try {
        // Use browser client to check existing session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Trader',
          })
        } else {
          clearUser()
        }
      } catch (err) {
        console.error('[AUTH SESSION CHECK ERROR]', err)
        clearUser()
      }
    }

    checkSession()
  }, [setUser, clearUser])

  // Listen for auth state changes via Supabase browser client
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH STATE CHANGE]', event)

      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Trader',
        })
      } else if (event === 'SIGNED_OUT') {
        clearUser()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update user data on token refresh
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Trader',
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, clearUser])

  // Login with email + password (browser client)
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[AUTH LOGIN] Attempting login for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('[AUTH LOGIN ERROR]', {
          message: error.message,
          status: error.status,
          code: (error as { code?: string }).code || 'unknown',
        })

        const message = loginErrorMap[error.message] || error.message
        return {
          success: false,
          error: message,
          debugCode: (error as { code?: string }).code,
        }
      }

      // onAuthStateChange will handle setting the user state
      console.log('[AUTH LOGIN] Success for:', data.user?.email)
      return { success: true }
    } catch (err) {
      console.error('[AUTH LOGIN EXCEPTION]', err)
      return { success: false, error: 'Terjadi kesalahan saat login' }
    }
  }, [])

  // Register with name, email + password (browser client)
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      console.log('[AUTH REGISTER] Attempting registration for:', email)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      })

      if (error) {
        console.error('[AUTH REGISTER ERROR]', {
          message: error.message,
          status: error.status,
        })

        const message = registerErrorMap[error.message] || error.message
        return { success: false, error: message }
      }

      console.log('[AUTH REGISTER] Success for:', email, data.user?.confirmed_at ? '(auto-confirmed)' : '(pending confirmation)')
      return { success: true }
    } catch (err) {
      console.error('[AUTH REGISTER EXCEPTION]', err)
      return { success: false, error: 'Terjadi kesalahan saat mendaftar' }
    }
  }, [])

  // Forgot password (browser client)
  const forgotPassword = useCallback(async (email: string) => {
    try {
      console.log('[AUTH FORGOT] Sending reset email to:', email)

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=settings`,
      })

      if (error) {
        console.error('[AUTH FORGOT ERROR]', {
          message: error.message,
          status: error.status,
        })

        // Don't reveal if email exists or not (anti-enumeration)
        // But DO show rate limit errors so user knows to wait
        const message = forgotErrorMap[error.message] || 'Terjadi kesalahan. Coba lagi nanti.'
        return { success: false, error: message }
      }

      console.log('[AUTH FORGOT] Reset email sent to:', email)
      return { success: true }
    } catch (err) {
      console.error('[AUTH FORGOT EXCEPTION]', err)
      return { success: false, error: 'Terjadi kesalahan saat mengirim link reset' }
    }
  }, [])

  // Logout (browser client)
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[AUTH LOGOUT ERROR]', err)
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
        register,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
