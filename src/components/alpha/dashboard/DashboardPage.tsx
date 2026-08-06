'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
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

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
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

  const score = data?.processScore ?? null
  const prevScore = data?.processScorePrevious ?? null
  const todayCount = data?.todayTradesCount ?? 0

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Welcome Hero */}
        <WelcomeHero
          todayTradesCount={todayCount}
          processScore={score}
          traderName={data?.trader?.name}
        />

        {/* Row 2: Process Score + AI Insight */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <ProcessScoreCard score={score} previousScore={prevScore} />
          </div>
          <div className="md:col-span-5">
            <AIInsightCard insight={data?.latestInsight ?? null} />
          </div>
        </div>

        {/* Row 3: Quick Actions */}
        <QuickActions />

        {/* Row 4: Recent Trades + Weekly Progress */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6">
            <RecentTrades
              trades={data?.recentTrades ?? []}
              isLoading={isLoading}
            />
          </div>
          <div className="md:col-span-6">
            <WeeklyProgress data={data?.weeklyTrend ?? []} />
          </div>
        </div>

        {/* Row 5: Reflection Gap + Behavioral Trend */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <ReflectionGapSummary
              unreflectedCount={data?.unreflectedCount ?? 0}
            />
          </div>
          <div className="md:col-span-7">
            <BehavioralTrend tags={[]} />
          </div>
        </div>
      </div>
    </main>
  )
}
