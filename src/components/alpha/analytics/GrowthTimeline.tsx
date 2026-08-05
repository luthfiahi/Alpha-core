'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Activity, Target, Brain, ShieldCheck, Grip, ShieldAlert } from 'lucide-react'
import { ScoreCard } from './ScoreCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ========================================
// Types
// ========================================
interface GrowthSnapshot {
  periodDate: string
  emotionScore: number | null
  consistencyScore: number | null
  processScore: number | null
  behaviorScore: number | null
  disciplineScore: number | null
  riskMgmtScore: number | null
}

interface GrowthData {
  snapshots: GrowthSnapshot[]
  currentScores: {
    emotion: number | null
    consistency: number | null
    process: number | null
    behavior: number | null
    discipline: number | null
    riskMgmt: number | null
  }
  trends: {
    emotion: 'up' | 'down' | 'stable'
    consistency: 'up' | 'down' | 'stable'
    process: 'up' | 'down' | 'stable'
    behavior: 'up' | 'down' | 'stable'
    discipline: 'up' | 'down' | 'stable'
    riskMgmt: 'up' | 'down' | 'stable'
  }
  diffs: {
    emotion: number | null
    consistency: number | null
    process: number | null
    behavior: number | null
    discipline: number | null
    riskMgmt: number | null
  }
}

// ========================================
// Dimension config
// ========================================
interface DimensionConfig {
  key: keyof typeof COLORS
  label: string
  color: string
  dataKey: string
  icon: React.ReactNode
}

const COLORS = {
  emotion: '#F59E0B',
  consistency: '#22C55E',
  process: '#6366F1',
  behavior: '#EC4899',
  discipline: '#14B8A6',
  riskMgmt: '#F97316',
} as const

const ALL_DIMENSIONS: DimensionConfig[] = [
  { key: 'emotion', label: 'Emosi', color: COLORS.emotion, dataKey: 'emotionScore', icon: <Brain className="w-4 h-4" /> },
  { key: 'consistency', label: 'Konsistensi', color: COLORS.consistency, dataKey: 'consistencyScore', icon: <Grip className="w-4 h-4" /> },
  { key: 'process', label: 'Proses', color: COLORS.process, dataKey: 'processScore', icon: <Activity className="w-4 h-4" /> },
  { key: 'behavior', label: 'Perilaku', color: COLORS.behavior, dataKey: 'behaviorScore', icon: <ShieldCheck className="w-4 h-4" /> },
]

const PERIODS = ['DAILY', 'WEEKLY', 'MONTHLY'] as const
const PERIOD_LABELS: Record<string, string> = {
  DAILY: 'Harian',
  WEEKLY: 'Mingguan',
  MONTHLY: 'Bulanan',
}

// ========================================
// Custom tooltip
// ========================================
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#151827] border border-[#232636] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-[#6B7280] mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-[#9CA3AF]">{entry.dataKey.replace('Score', '')}</span>
            <span className="text-xs font-financial font-semibold text-[#F3F4F6] ml-auto">
              {Math.round(entry.value * 10) / 10}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================================
// Component
// ========================================
export function GrowthTimeline() {
  const [activeDimensions, setActiveDimensions] = useState<Set<string>>(
    new Set(['emotion', 'consistency', 'process', 'behavior'])
  )
  const [period, setPeriod] = useState<string>('DAILY')
  const [data, setData] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/growth?period=${p}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch growth data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  const handlePeriodChange = (p: string) => {
    setPeriod(p)
  }

  const toggleDimension = (key: string) => {
    setActiveDimensions((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Format date label
  const formatLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      if (period === 'DAILY') return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      if (period === 'WEEKLY') return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      return d.toLocaleDateString('id-ID', { month: 'short' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#F3F4F6]">Timeline Pertumbuhan</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Pantau perkembangan berbagai dimensi trading</p>
          </div>
          {/* Period selector */}
          <div className="flex items-center bg-[#10121E] rounded-lg p-1 gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  period === p
                    ? 'bg-[#1E2030] text-[#F3F4F6]'
                    : 'text-[#6B7280] hover:text-[#9CA3AF]'
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension toggles */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_DIMENSIONS.map((dim) => (
            <button
              key={dim.key}
              onClick={() => toggleDimension(dim.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                activeDimensions.has(dim.key)
                  ? 'border-opacity-30 bg-opacity-10'
                  : 'border-[#232636] text-[#6B7280] opacity-50'
              )}
              style={
                activeDimensions.has(dim.key)
                  ? {
                      borderColor: dim.color + '50',
                      backgroundColor: dim.color + '15',
                      color: dim.color,
                    }
                  : undefined
              }
            >
              {dim.icon}
              {dim.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : data?.snapshots && data.snapshots.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.snapshots.map((s) => ({ ...s, label: formatLabel(s.periodDate) }))}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#232636"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  ticks={[0, 25, 50, 75, 100]}
                  dx={-4}
                />
                <Tooltip content={<ChartTooltip />} />
                {ALL_DIMENSIONS.map(
                  (dim) =>
                    activeDimensions.has(dim.key) && (
                      <Line
                        key={dim.key}
                        type="monotone"
                        dataKey={dim.dataKey}
                        stroke={dim.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: dim.color, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: dim.color, stroke: '#151827', strokeWidth: 2 }}
                        connectNulls
                      />
                    )
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Target className="w-10 h-10 text-[#232636] mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">Belum ada data growth</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard
          label="Emosi"
          score={data?.currentScores.emotion ?? null}
          diff={data?.diffs.emotion ?? null}
          trend={data?.trends.emotion ?? 'stable'}
          color={COLORS.emotion}
          icon={<Brain className="w-4 h-4" />}
        />
        <ScoreCard
          label="Konsistensi"
          score={data?.currentScores.consistency ?? null}
          diff={data?.diffs.consistency ?? null}
          trend={data?.trends.consistency ?? 'stable'}
          color={COLORS.consistency}
          icon={<Grip className="w-4 h-4" />}
        />
        <ScoreCard
          label="Proses"
          score={data?.currentScores.process ?? null}
          diff={data?.diffs.process ?? null}
          trend={data?.trends.process ?? 'stable'}
          color={COLORS.process}
          icon={<Activity className="w-4 h-4" />}
        />
        <ScoreCard
          label="Perilaku"
          score={data?.currentScores.behavior ?? null}
          diff={data?.diffs.behavior ?? null}
          trend={data?.trends.behavior ?? 'stable'}
          color={COLORS.behavior}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </div>
    </div>
  )
}
