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
      <div role="main" className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header bar */}
        {isMobile && (
          <MobileHeader />
        )}

        {/* Page content — overflow-x-hidden prevents any horizontal leak */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-12">
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
      </div>
    </div>
  )
}

// ========================================
// Mobile Header Bar
// ========================================

function AlphaLogoMarkSmall({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2L29 16L16 30L3 16L16 2Z"
        fill="url(#mobile-alpha-gradient)"
        stroke="rgba(129,140,248,0.3)"
        strokeWidth="0.5"
      />
      <text
        x="16"
        y="17.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFFFFF"
        fontSize="16"
        fontWeight="700"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        style={{ letterSpacing: '-0.02em' }}
      >
        α
      </text>
      <defs>
        <linearGradient
          id="mobile-alpha-gradient"
          x1="3"
          y1="2"
          x2="29"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#818CF8" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function MobileHeader() {
  const currentPage = useNavigationStore((s) => s.currentPage)

  const pageLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    journal: 'Journal',
    'journal-new': 'New Entry',
    'journal-detail': 'Trade Detail',
    coaching: 'AI Coach',
    analytics: 'Analytics',
    'trading-dna': 'Trading DNA',
    playbook: 'Playbook',
    settings: 'Settings',
  }

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 px-4 relative"
      style={{
        opacity: 1,
        borderBottom: '1px solid #232636',
        boxShadow: '0 1px 8px rgba(0,0,0,0.2)',
      }}
    >
      <AppSidebar />
      <AlphaLogoMarkSmall size={24} />
      <h1 className="text-sm font-semibold text-[#F3F4F6]">
        {pageLabels[currentPage] || 'Project Alpha'}
      </h1>
    </header>
  )
}