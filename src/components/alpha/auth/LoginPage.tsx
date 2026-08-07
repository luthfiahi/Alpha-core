'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './AuthProvider'

// ========================================
// Login Page — Email + Password Auth
// With: Login, Register, Forgot Password
// ========================================

type ViewState = 'login' | 'register' | 'forgot' | 'forgot-success' | 'register-success'
type FormState = 'idle' | 'loading' | 'error'

const inputClass =
  'h-11 rounded-lg border-[#232636] bg-[#0B0D17] pl-3.5 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/50 focus-visible:border-[#6366F1]/50'
const labelClass = 'text-sm font-medium text-[#9CA3AF]'

// ─── Password Toggle ────────────────────────
function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
      tabIndex={-1}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}

// ─── Error Box ──────────────────────────────
function ErrorBox({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400 leading-relaxed"
    >
      {message}
    </motion.div>
  )
}

// ─── Brand Header ───────────────────────────
function BrandHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-[#6366F1]/25"
      >
        <Brain className="h-7 w-7 text-white" />
      </motion.div>
      <h1 className="text-xl font-bold text-[#F3F4F6]">Project Alpha</h1>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Sparkles size={12} className="text-[#6366F1]" />
        <p className="text-xs font-medium text-[#6B7280]">
          Trade Better. Think Better. Become Better.
        </p>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login, register, forgotPassword } = useAuth()
  const [view, setView] = useState<ViewState>('login')
  const [formState, setFormState] = useState<FormState>('idle')
  const [formError, setFormError] = useState('')
  const [authCallbackError, setAuthCallbackError] = useState('')

  // Check for auth error from URL params (e.g., expired link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('auth_error')
    if (error) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setAuthCallbackError(error))
      // Clean URL
      window.history.replaceState({}, '', '/')
    }
  }, [])

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState('')

  function resetFormState() {
    setFormState('idle')
    setFormError('')
  }

  function switchView(v: ViewState) {
    setView(v)
    resetFormState()
  }

  // ─── Clear all Supabase cookies ───────────
  function clearAuthCookies() {
    // Remove all Supabase auth cookies
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0]
      if (name.startsWith('sb-') || name === 'supabase-auth-token') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      }
    })
    // Also clear localStorage
    try {
      localStorage.removeItem('supabase.auth.token')
    } catch { /* ignore */ }
  }

  // ─── Handle Login ────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) return

    setFormState('loading')
    setFormError('')

    const result = await login(loginEmail.trim(), loginPassword)

    if (!result.success) {
      setFormState('error')
      setFormError(result.error || 'Email atau password salah')
    }
  }

  // ─── Handle Register ──────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regName.trim() || !regEmail.trim() || !regPassword) return
    if (regPassword.length < 6) {
      setFormState('error')
      setFormError('Password minimal 6 karakter')
      return
    }

    setFormState('loading')
    setFormError('')

    const result = await register(regName.trim(), regEmail.trim(), regPassword)

    if (result.success) {
      setView('register-success')
    } else if (result.error === 'EMAIL_EXISTS') {
      // Email already registered → redirect to forgot password to set password
      setForgotEmail(regEmail.trim())
      switchView('forgot')
    } else {
      setFormState('error')
      setFormError(result.error || 'Gagal mendaftar')
    }
  }

  // ─── Handle Forgot Password ───────────────
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return

    setFormState('loading')
    setFormError('')

    const result = await forgotPassword(forgotEmail.trim())

    if (result.success) {
      setView('forgot-success')
    } else {
      setFormState('error')
      setFormError(result.error || 'Gagal mengirim link reset')
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0D17] p-4">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#6366F1]/[0.07] blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#8B5CF6]/[0.05] blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366F1]/[0.03] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-[#232636] bg-[#151827] p-8 shadow-2xl shadow-black/40">
          {/* Auth callback error banner (e.g., expired link) */}
          <AnimatePresence>
            {authCallbackError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs text-amber-400 leading-relaxed"
              >
                ⚠️ {authCallbackError}
                <button
                  type="button"
                  onClick={() => setAuthCallbackError('')}
                  className="float-right text-amber-500/60 hover:text-amber-400 ml-2"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ═══════ LOGIN VIEW ═══════ */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <BrandHeader />

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className={labelClass}>
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="trader@email.com"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value)
                        if (formState === 'error') resetFormState()
                      }}
                      disabled={formState === 'loading'}
                      className={inputClass}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className={labelClass}>
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value)
                          if (formState === 'error') resetFormState()
                        }}
                        disabled={formState === 'loading'}
                        className={`${inputClass} pr-10`}
                        autoComplete="current-password"
                      />
                      <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {formState === 'error' && formError && (
                      <div>
                        <ErrorBox message={formError} />
                        <button
                          type="button"
                          onClick={() => {
                            clearAuthCookies()
                            resetFormState()
                          }}
                          className="mt-2 block w-full text-center text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          🔄 Bersihkan data login & coba lagi
                        </button>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={formState === 'loading' || !loginEmail.trim() || !loginPassword}
                    className="h-11 w-full rounded-lg bg-[#6366F1] text-sm font-semibold text-white hover:bg-[#5558E6] active:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Masuk...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </Button>
                </form>

                {/* Forgot Password Link */}
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="mt-4 block w-full text-center text-xs text-[#6366F1] hover:text-[#818CF8] transition-colors"
                >
                  Lupa password?
                </button>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#232636]" />
                  <span className="text-[11px] text-[#4B5563]">atau</span>
                  <div className="h-px flex-1 bg-[#232636]" />
                </div>

                {/* Register Link */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => switchView('register')}
                  className="h-11 w-full rounded-lg border border-[#232636] text-sm font-medium text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F3F4F6] transition-colors"
                >
                  <UserPlus size={16} className="mr-2" />
                  Daftar Akun Baru
                </Button>

                <p className="mt-5 text-center text-[11px] text-[#4B5563] leading-relaxed">
                  Dengan masuk, kamu menyetujui Ketentuan Layanan kami.
                </p>
              </motion.div>
            )}

            {/* ═══════ REGISTER VIEW ═══════ */}
            {view === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="mb-6 flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>

                <div className="mb-6 text-center">
                  <h2 className="text-lg font-semibold text-[#F3F4F6]">
                    Buat Akun Baru
                  </h2>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Mulai perjalanan trading kamu dengan AI Coach
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className={labelClass}>
                      Nama
                    </Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Nama lengkap kamu"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value)
                        if (formState === 'error') resetFormState()
                      }}
                      disabled={formState === 'loading'}
                      className={inputClass}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className={labelClass}>
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="trader@email.com"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value)
                        if (formState === 'error') resetFormState()
                      }}
                      disabled={formState === 'loading'}
                      className={inputClass}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className={labelClass}>
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value)
                          if (formState === 'error') resetFormState()
                        }}
                        disabled={formState === 'loading'}
                        className={`${inputClass} pr-10`}
                        autoComplete="new-password"
                      />
                      <PasswordToggle show={showRegPassword} onToggle={() => setShowRegPassword(!showRegPassword)} />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {formState === 'error' && formError && (
                      <ErrorBox message={formError} />
                    )}
                  </AnimatePresence>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    disabled={
                      formState === 'loading' ||
                      !regName.trim() ||
                      !regEmail.trim() ||
                      !regPassword
                    }
                    className="h-11 w-full rounded-lg bg-[#6366F1] text-sm font-semibold text-white hover:bg-[#5558E6] active:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mendaftar...
                      </>
                    ) : (
                      'Daftar'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ═══════ REGISTER SUCCESS ═══════ */}
            {view === 'register-success' && (
              <motion.div
                key="reg-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/25"
                >
                  <UserPlus className="h-8 w-8 text-emerald-400" />
                </motion.div>

                <h2 className="mb-2 text-xl font-semibold text-[#F3F4F6]">
                  Akun Berhasil Dibuat! 🎉
                </h2>
                <p className="mb-1 text-sm text-[#9CA3AF]">
                  Cek email kamu untuk verifikasi:
                </p>
                <p className="mb-6 text-sm font-medium text-[#6366F1]">
                  {regEmail}
                </p>
                <p className="mb-8 text-xs text-[#6B7280] leading-relaxed">
                  Setelah verifikasi, kamu bisa langsung login.
                </p>

                <Button
                  onClick={() => {
                    setLoginEmail(regEmail)
                    switchView('login')
                  }}
                  className="h-11 w-full rounded-lg bg-[#6366F1] text-sm font-semibold text-white hover:bg-[#5558E6] transition-colors"
                >
                  Masuk Sekarang
                </Button>
              </motion.div>
            )}

            {/* ═══════ FORGOT PASSWORD VIEW ═══════ */}
            {view === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="mb-6 flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>

                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/25"
                  >
                    <KeyRound className="h-7 w-7 text-amber-400" />
                  </motion.div>
                  <h2 className="text-lg font-semibold text-[#F3F4F6]">
                    Lupa Password?
                  </h2>
                  <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
                    Masukkan email kamu dan kami akan kirim link untuk reset password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className={labelClass}>
                      Email
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="trader@email.com"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value)
                        if (formState === 'error') resetFormState()
                      }}
                      disabled={formState === 'loading'}
                      className={inputClass}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {formState === 'error' && formError && (
                      <ErrorBox message={formError} />
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={formState === 'loading' || !forgotEmail.trim()}
                    className="h-11 w-full rounded-lg bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Kirim Link Reset
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ═══════ FORGOT PASSWORD SUCCESS ═══════ */}
            {view === 'forgot-success' && (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/15 ring-1 ring-[#6366F1]/25"
                >
                  <Mail className="h-8 w-8 text-[#6366F1]" />
                </motion.div>

                <h2 className="mb-2 text-xl font-semibold text-[#F3F4F6]">
                  Cek Email Kamu
                </h2>
                <p className="mb-1 text-sm text-[#9CA3AF]">
                  Kami sudah mengirim link reset password ke:
                </p>
                <p className="mb-6 text-sm font-medium text-[#6366F1]">
                  {forgotEmail}
                </p>
                <p className="mb-8 text-xs text-[#6B7280] leading-relaxed">
                  Klik link di email untuk membuat password baru. Link berlaku selama 1 jam.
                </p>

                <Button
                  variant="ghost"
                  onClick={() => switchView('login')}
                  className="gap-2 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom attribution */}
        <p className="mt-4 text-center text-[11px] text-[#374151]">
          Project Alpha v0.2 — AI Trading Coach
        </p>
      </motion.div>
    </div>
  )
}
