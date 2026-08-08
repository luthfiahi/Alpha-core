'use client'

import React, { Component, Suspense, useSyncExternalStore, useCallback, type ErrorInfo, type ReactNode } from 'react'
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
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ========================================
// Client-only mount guard — prevents hydration mismatch
// ========================================
function ClientOnly({ children }: { children: ReactNode }) {
  // useSyncExternalStore to detect client mount without triggering React Compiler warnings
  const mounted = useSyncExternalStore(
    // subscribe: no-op (mounted never changes after subscribing)
    useCallback(() => () => {}, []),
    // getSnapshot (client): always true
    () => true,
    // getServerSnapshot (server): always false
    () => false,
  )
  if (!mounted) return <AuthLoadingScreen />
  return <>{children}</>
}

// ========================================
// Error Boundary — catches React crashes
// ========================================
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[APP ERROR BOUNDARY]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0B0D17] p-6">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/25">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-[#F3F4F6]">Terjadi Kesalahan</h2>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              {this.state.error?.message || 'Halaman mengalami error yang tidak terduga.'}
            </p>
            <div className="w-full rounded-lg bg-[#151827] border border-[#232636] p-3 mt-2">
              <p className="text-[10px] text-[#4B5563] font-mono break-all">
                {this.state.error?.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'}
              </p>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="gap-2 bg-[#6366F1] hover:bg-[#5558E6]"
            >
              <RefreshCw size={16} />
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ========================================
// Page map for client-side routing
// ========================================
function PageContent() {
  const currentPage = useNavigationStore((s) => s.currentPage)

  // Simple conditional rendering — no AnimatePresence to avoid React #301 hydration errors
  switch (currentPage) {
    case 'dashboard': return <DashboardPage />
    case 'journal': return <JournalPage />
    case 'journal-new': return <JournalNewPage />
    case 'journal-detail': return <JournalDetailPage />
    case 'coaching': return <CoachingPage />
    case 'analytics': return <AnalyticsPage />
    case 'playbook': return <PlaybookPage />
    case 'trading-dna': return <TradingDNAPage />
    case 'settings': return <SettingsPage />
    default: return <DashboardPage />
  }
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
    <ClientOnly>
      <AuthProvider>
        <AuthGuard>
          <AppErrorBoundary>
            <AppLayout>
              <Suspense fallback={<PageSkeleton />}>
                <div className="alpha-animate-in">
                  <PageContent />
                </div>
              </Suspense>
            </AppLayout>
          </AppErrorBoundary>
        </AuthGuard>
      </AuthProvider>
    </ClientOnly>
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
