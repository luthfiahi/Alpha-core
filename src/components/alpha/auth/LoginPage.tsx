'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Mail, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './AuthProvider'

// ========================================
// Login Page — Magic Link Authentication
// ========================================

type LoginState = 'idle' | 'sending' | 'sent' | 'error'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<LoginState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) return

    setState('sending')
    setErrorMessage('')

    const result = await login(email.trim())

    if (result.success) {
      setState('sent')
    } else {
      setState('error')
      setErrorMessage(result.error || 'Terjadi kesalahan')
    }
  }

  function handleBackToForm() {
    setState('idle')
    setErrorMessage('')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0D17] p-4">
      {/* Subtle gradient background effects */}
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
          <AnimatePresence mode="wait">
            {state === 'sent' ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                {/* Mail icon with animation */}
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
                  Kami sudah mengirim magic link ke:
                </p>
                <p className="mb-6 text-sm font-medium text-[#6366F1]">
                  {email}
                </p>
                <p className="mb-8 text-xs text-[#6B7280] leading-relaxed">
                  Klik link di email untuk masuk. Link berlaku selama 24 jam.
                </p>

                <Button
                  variant="ghost"
                  onClick={handleBackToForm}
                  className="gap-2 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <ArrowLeft size={16} />
                  Kirim ke email lain
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Logo / Branding */}
                <div className="mb-8 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-[#6366F1]/25"
                  >
                    <Brain className="h-7 w-7 text-white" />
                  </motion.div>

                  <h1 className="text-xl font-bold text-[#F3F4F6]">
                    Project Alpha
                  </h1>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#6366F1]" />
                    <p className="text-xs font-medium text-[#6B7280]">
                      Trade Better. Think Better. Become Better.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-[#9CA3AF]"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="trader@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (state === 'error') {
                          setState('idle')
                          setErrorMessage('')
                        }
                      }}
                      disabled={state === 'sending'}
                      className="h-11 rounded-lg border-[#232636] bg-[#0B0D17] pl-3.5 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/50 focus-visible:border-[#6366F1]/50"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {state === 'error' && errorMessage && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                      >
                        {errorMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={state === 'sending' || !email.trim()}
                    className="h-11 w-full rounded-lg bg-[#6366F1] text-sm font-semibold text-white hover:bg-[#5558E6] active:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state === 'sending' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Magic Link'
                    )}
                  </Button>
                </form>

                {/* Footer hint */}
                <p className="mt-6 text-center text-[11px] text-[#4B5563] leading-relaxed">
                  Dengan masuk, kamu menyetujui Ketentuan Layanan kami.
                  <br />
                  Tidak perlu password — kami kirim link login ke email kamu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom attribution */}
        <p className="mt-4 text-center text-[11px] text-[#374151]">
          Project Alpha v0.1 — AI Trading Coach
        </p>
      </motion.div>
    </div>
  )
}
