'use client'

import React, { Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigationStore } from '@/stores'
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
// Root page (single route)
// ========================================
export default function Home() {
  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </AppLayout>
  )
}
