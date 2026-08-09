'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Brain, Activity, Grip, ShieldCheck } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GrowthTimeline } from './GrowthTimeline'
import { WeeklyReviewTab } from './WeeklyReviewTab'
import { BehavioralInsights } from './BehavioralInsights'
import { cn } from '@/lib/utils'

// ========================================
// Types (mirrors GrowthTimeline — no new packages)
// ========================================
interface QuickGrowthData {
  currentScores: {
    emotion: number | null
    consistency: number | null
    process: number | null
    behavior: number | null
  }
  trends: {
    emotion: 'up' | 'down' | 'stable'
    consistency: 'up' | 'down' | 'stable'
    process: 'up' | 'down' | 'stable'
    behavior: 'up' | 'down' | 'stable'
  }
}

// ========================================
// Metrics Row
// ========================================
const METRICS_CONFIG = [
  { key: 'emotion' as const, label: 'Emotion', icon: <Brain className="w-3.5 h-3.5" />, color: '#F59E0B' },
  { key: 'consistency' as const, label: 'Consistency', icon: <Grip className="w-3.5 h-3.5" />, color: '#22C55E' },
  { key: 'process' as const, label: 'Process', icon: <Activity className="w-3.5 h-3.5" />, color: '#6366F1' },
  { key: 'behavior' as const, label: 'Behavior', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: '#EC4899' },
]

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const color = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-[#6B7280]'
  const rotation = trend === 'up' ? '' : trend === 'down' ? 'rotate-180' : '-rotate-90'
  return (
    <TrendingUp className={cn('w-3 h-3', color, rotation)} />
  )
}

function MetricsRow() {
  const [data, setData] = useState<QuickGrowthData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/analytics/growth?period=DAILY')
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setReady(true)
        }
      } catch {
        if (!cancelled) setReady(true)
      }
    }
    fetchMetrics()
    return () => { cancelled = true }
  }, [])

  const scores = data?.currentScores
  const trends = data?.trends

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {METRICS_CONFIG.map((m) => {
        const value = scores?.[m.key] ?? null
        const trend = trends?.[m.key] ?? 'stable'
        return (
          <div
            key={m.key}
            className="alpha-card px-4 py-3 flex items-center gap-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: m.color + '15', color: m.color }}
            >
              {m.icon}
            </div>
            <div className="min-w-0">
              <p className="alpha-label text-[#9CA3AF]">{m.label}</p>
              <div className="flex items-center gap-1.5">
                <span className="font-financial text-lg font-semibold text-[#F3F4F6]">
                  {ready ? (value !== null ? value : '—') : '—'}
                </span>
                <TrendArrow trend={trend} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ========================================
// Main AnalyticsPage
// ========================================
export function AnalyticsPage() {
  return (
    <div className="space-y-6 alpha-animate-in">
      {/* Page Header */}
      <div>
        <h1 className="alpha-heading-xl uppercase tracking-wider text-[#F3F4F6]">ANALYTICS</h1>
        <p className="alpha-body mt-1.5">
          Pantau emosi, konsistensi, proses dan perilaku tradingmu
        </p>
      </div>

      {/* Metrics Summary Row */}
      <MetricsRow />

      {/* Tabbed Interface */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="bg-[#151827] border border-[#232636] rounded-xl p-1 gap-1 h-auto">
          <TabsTrigger
            value="growth"
            className="gap-1.5 data-[state=active]:bg-[#6366F1]/20 data-[state=active]:text-[#F3F4F6] data-[state=active]:border data-[state=active]:border-[#6366F1]/40 text-[#6B7280] data-[state=active]:shadow-none rounded-lg px-4 py-2.5 alpha-label transition-all data-[state=active]:shadow-[0_0_16px_rgba(99,102,241,0.15)] data-[state=active]:font-semibold"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Growth</span>
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="gap-1.5 data-[state=active]:bg-[#6366F1]/20 data-[state=active]:text-[#F3F4F6] data-[state=active]:border data-[state=active]:border-[#6366F1]/40 text-[#6B7280] data-[state=active]:shadow-none rounded-lg px-4 py-2.5 alpha-label transition-all data-[state=active]:shadow-[0_0_16px_rgba(99,102,241,0.15)] data-[state=active]:font-semibold"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Weekly Review</span>
          </TabsTrigger>
          <TabsTrigger
            value="behavioral"
            className="gap-1.5 data-[state=active]:bg-[#6366F1]/20 data-[state=active]:text-[#F3F4F6] data-[state=active]:border data-[state=active]:border-[#6366F1]/40 text-[#6B7280] data-[state=active]:shadow-none rounded-lg px-4 py-2.5 alpha-label transition-all data-[state=active]:shadow-[0_0_16px_rgba(99,102,241,0.15)] data-[state=active]:font-semibold"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Behavioral</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="mt-5">
          <div className="alpha-animate-in alpha-stagger-1">
            <GrowthTimeline />
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-5">
          <div className="alpha-animate-in alpha-stagger-2">
            <WeeklyReviewTab />
          </div>
        </TabsContent>

        <TabsContent value="behavioral" className="mt-5">
          <div className="alpha-animate-in alpha-stagger-3">
            <BehavioralInsights />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
