'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTraderStore } from '@/stores'
import { WelcomeHero } from './WelcomeHero'
import { ProcessScoreCard } from './ProcessScoreCard'
import { AIInsightCard } from './AIInsightCard'
import { QuickActions } from './QuickActions'
import { RecentTrades, type TradeRow } from './RecentTrades'
import { WeeklyProgress } from './WeeklyProgress'
import { ReflectionGapSummary } from './ReflectionGapSummary'

interface DashboardData {
  trader: { id: string; name: string; email: string }
  processScore: number | null
  processScorePrevious: number | null
  recentTrades: TradeRow[]
  unreflectedCount: number
  latestInsight: {
    id: string
    title: string
    content: string
    createdAt: string
    category: string
  } | null
  weeklyTrend: { date: string; score: number }[]
  totalClosedTrades: number
  winRate: number
  todayTradesCount: number
}

/* -------------------------------------------------------------------------- */
/*  Skeleton — mimics the dashboard layout structure                         */
/* -------------------------------------------------------------------------- */

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`alpha-skeleton rounded-lg ${className ?? ''}`} />
}

function DashboardSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Welcome Hero skeleton */}
        <SkeletonBlock className="h-32 w-full" />

        {/* Row 2: Process Score + AI Insight */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <SkeletonBlock className="h-64 w-full rounded-xl" />
          </div>
          <div className="md:col-span-5">
            <SkeletonBlock className="h-64 w-full rounded-xl" />
          </div>
        </div>

        {/* Row 3: Quick Actions skeleton */}
        <SkeletonBlock className="h-16 w-full rounded-xl" />

        {/* Row 4: Recent Trades + Weekly Progress */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <SkeletonBlock className="h-80 w-full rounded-xl" />
          </div>
          <div className="md:col-span-5">
            <SkeletonBlock className="h-80 w-full rounded-xl" />
          </div>
        </div>

        {/* Row 5: Reflection Gap */}
        <SkeletonBlock className="h-28 w-full rounded-xl" />
      </div>
    </main>
  )
}

/* -------------------------------------------------------------------------- */
/*  Error State                                                              */
/* -------------------------------------------------------------------------- */

function DashboardError({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="bg-[#0B0D17] border border-[#1E2030] rounded-xl max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Gagal Memuat Dashboard
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {message ?? 'Terjadi kesalahan saat mengambil data dashboard. Silakan coba lagi.'}
            </p>
            <Button
              onClick={onRetry}
              variant="outline"
              className="mt-2 gap-2 border-[#1E2030] text-zinc-300 hover:bg-[#1E2030] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Page                                                           */
/* -------------------------------------------------------------------------- */

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard')
      const json = await res.json()
      return json as DashboardData
    },
  })

  // Sync trader data to store — only on first load
  const hasSynced = useRef(false)
  useEffect(() => {
    if (hasSynced.current || !data?.trader) return
    hasSynced.current = true
    const { setTrader, updateProcessScore } = useTraderStore.getState()
    setTrader({
      id: data.trader.id,
      name: data.trader.name ?? 'Trader',
      email: data.trader.email,
      processScore: data.processScore ?? 0,
      totalTrades: data.totalClosedTrades,
      winRate: data.winRate,
    })
    if (data.processScore !== null) {
      updateProcessScore(data.processScore)
    }
  }, [data])

  /* ------ Loading state ------ */
  if (isLoading) {
    return <DashboardSkeleton />
  }

  /* ------ Error state ------ */
  if (isError) {
    return (
      <DashboardError
        message={error?.message}
        onRetry={() => refetch()}
      />
    )
  }

  const score = data?.processScore ?? null
  const prevScore = data?.processScorePrevious ?? null
  const todayCount = data?.todayTradesCount ?? 0

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Welcome Hero */}
        <div className="alpha-animate-in alpha-stagger-1">
          <WelcomeHero
            todayTradesCount={todayCount}
            processScore={score}
            traderName={data?.trader?.name}
          />
        </div>

        {/* Row 2: Process Score + AI Insight */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 alpha-animate-in alpha-stagger-2">
          <div className="md:col-span-7">
            <ProcessScoreCard score={score} previousScore={prevScore} />
          </div>
          <div className="md:col-span-5">
            <AIInsightCard insight={data?.latestInsight ?? null} traderContext={{ todayTradesCount: todayCount, processScore: score }} />
          </div>
        </div>

        {/* Row 3: Quick Actions */}
        <div className="alpha-animate-in alpha-stagger-3">
          <QuickActions />
        </div>

        {/* Row 4: Recent Trades + Weekly Progress */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 alpha-animate-in alpha-stagger-4">
          <div className="md:col-span-7">
            <RecentTrades
              trades={data?.recentTrades ?? []}
              isLoading={false}
            />
          </div>
          <div className="md:col-span-5">
            <WeeklyProgress data={data?.weeklyTrend ?? []} />
          </div>
        </div>

        {/* Row 5: Reflection Gap */}
        <div className="alpha-animate-in alpha-stagger-5">
          <ReflectionGapSummary
            unreflectedCount={data?.unreflectedCount ?? 0}
          />
        </div>
      </div>
    </main>
  )
}