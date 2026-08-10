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
import { BehavioralTrend } from './BehavioralTrend'

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
    <div className="space-y-5">
      {/* Row 1: Welcome Hero skeleton */}
      <SkeletonBlock className="h-28 w-full" />

      {/* Row 2: Process Score + AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <SkeletonBlock className="h-64 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-5">
          <SkeletonBlock className="h-64 w-full rounded-xl" />
        </div>
      </div>

      {/* Row 3: Quick Actions skeleton */}
      <SkeletonBlock className="h-24 w-full rounded-xl" />

      {/* Row 4: Recent Trades + Weekly Progress + Behavioral Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <SkeletonBlock className="h-80 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-4">
          <SkeletonBlock className="h-80 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-3">
          <SkeletonBlock className="h-80 w-full rounded-xl" />
        </div>
      </div>

      {/* Row 5: Reflection Gap */}
      <SkeletonBlock className="h-28 w-full rounded-xl" />
    </div>
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
    <div className="flex items-center justify-center min-h-[60vh]">
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
  )
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Page — No redundant <main> wrapper.
     AppLayout already provides scroll context + padding.
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
      processScore: data.processScore ?? null,
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
  const unreflected = data?.unreflectedCount ?? 0

  return (
    <div className="space-y-5 pb-8">
      {/* Row 1: Welcome Hero */}
      <div className="alpha-animate-in alpha-stagger-1">
        <WelcomeHero
          todayTradesCount={todayCount}
          processScore={score}
          traderName={data?.trader?.name}
        />
      </div>

      {/* Row 2: Process Score + AI Insight — min-w-0 prevents grid blowout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 alpha-animate-in alpha-stagger-2">
        <div className="lg:col-span-7 min-w-0">
          <ProcessScoreCard score={score} previousScore={prevScore} />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <AIInsightCard insight={data?.latestInsight ?? null} traderContext={{ todayTradesCount: todayCount, processScore: score }} />
        </div>
      </div>

      {/* Row 3: Quick Actions */}
      <div className="alpha-animate-in alpha-stagger-3">
        <QuickActions unreflectedCount={unreflected} />
      </div>

      {/* Row 4: Recent Trades + Weekly Progress + Behavioral Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 alpha-animate-in alpha-stagger-4">
        <div className="lg:col-span-5 min-w-0">
          <RecentTrades
            trades={data?.recentTrades ?? []}
            isLoading={false}
          />
        </div>
        <div className="lg:col-span-4 min-w-0">
          <WeeklyProgress data={data?.weeklyTrend ?? []} />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <BehavioralTrend tags={[]} />
        </div>
      </div>

      {/* Row 5: Reflection Gap */}
      <div className="alpha-animate-in alpha-stagger-5">
        <ReflectionGapSummary
          unreflectedCount={unreflected}
        />
      </div>
    </div>
  )
}
