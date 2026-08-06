'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useNavigationStore } from '@/stores'
import { AppSidebar } from './AppSidebar'

// ========================================
// AppLayout — Root layout wrapper
// Flex row: Sidebar (left) + Main Content (right)
// ========================================

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B0D17]">
      {/* Sidebar — hidden on mobile (handled inside AppSidebar) */}
      {!isMobile && <AppSidebar />}

      {/* Main content area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header bar */}
        {isMobile && (
          <MobileHeader />
        )}

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div
            className={cn(
              'mx-auto w-full px-4 py-6',
              'max-w-[1280px]',
              // Extra padding on larger screens
              'sm:px-6'
            )}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

// ========================================
// Mobile Header Bar
// ========================================

function MobileHeader() {
  const currentPage = useNavigationStore((s) => s.currentPage)

  const pageLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    journal: 'Journal',
    'journal-new': 'New Entry',
    'journal-detail': 'Trade Detail',
    coaching: 'AI Coach',
    analytics: 'Analytics',
    playbook: 'Playbook',
    settings: 'Settings',
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#232636] px-4">
      <AppSidebar />
      <h1 className="text-sm font-semibold text-[#F3F4F6]">
        {pageLabels[currentPage] || 'Project Alpha'}
      </h1>
    </header>
  )
}
