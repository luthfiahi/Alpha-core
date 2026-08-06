'use client'

import React, { Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigationStore } from '@/stores'
import { useAuthStore } from '@/stores/auth-store'
import { AuthProvider, LoginPage } from '@/components/alpha/auth'
import { AppLayout } from '@/components/alpha/AppLayout'
import { DashboardPage } from '@/components/alpha/dashboard'
import { JournalPage, JournalNewPage, JournalDetailPage } from '@/components/alpha/journal'
import { CoachingPage } from '@/components/alpha/coaching'
import { AnalyticsPage } from '@/components/alpha/analytics'
import { PlaybookPage } from '@/components/alpha/playbook'
import { TradingDNAPage } from '@/components/alpha/trading-dna'
import { SettingsPage } from '@/components/alpha/settings'

// ========================================
// Page map for client-side routing
// ========================================
function PageContent() {
  const currentPage = useNavigationStore((s) => s.currentPage)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'journal' && <JournalPage />}
        {currentPage === 'journal-new' && <JournalNewPage />}
        {currentPage === 'journal-detail' && <JournalDetailPage />}
        {currentPage === 'coaching' && <CoachingPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'playbook' && <PlaybookPage />}
        {currentPage === 'trading-dna' && <TradingDNAPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </motion.div>
    </AnimatePresence>
  )
}

// ========================================
// Loading skeleton
// ========================================
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-[#151827] rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-32 bg-[#151827] rounded-[14px]" />
        <div className="h-32 bg-[#151827] rounded-[14px]" />
      </div>
      <div className="h-64 bg-[#151827] rounded-[14px]" />
    </div>
  )
}

// ========================================
// Loading screen (shown while checking auth)
// ========================================
function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0D17]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] animate-pulse">
          <span className="text-lg font-bold text-white">A</span>
        </div>
        <p className="text-sm text-[#6B7280]">Memuat...</p>
      </div>
    </div>
  )
}

// ========================================
// Root page (single route)
// ========================================
export default function Home() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PageContent />
          </Suspense>
        </AppLayout>
      </AuthGuard>
    </AuthProvider>
  )
}

// ========================================
// Auth Guard — shows login or app based on auth state
// ========================================
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}
