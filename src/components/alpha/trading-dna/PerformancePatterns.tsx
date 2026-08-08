'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, BarChart3, XCircle, X, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface PerformancePatternsProps {
  bestSetup: string | null
  bestSession: string | null
  bestRiskReward: string | null
  bestPair: string | null
  worstSetup: string | null
  worstSession: string | null
  isLoading: boolean
}

const SESSION_LABELS: Record<string, string> = {
  LONDON: 'London Session',
  NEW_YORK: 'New York Session',
  ASIAN: 'Asian Session',
}

interface BehavioralMetric {
  label: string
  value: number | null
  description: string
}

function getBarColor(value: number | null): string {
  if (value === null) return '#232636'
  if (value >= 70) return '#22C55E'
  if (value >= 40) return '#F59E0B'
  return '#EF4444'
}

function getBarBgColor(value: number | null): string {
  if (value === null) return '#1E2030'
  if (value >= 70) return 'rgba(34, 197, 94, 0.08)'
  if (value >= 40) return 'rgba(245, 158, 11, 0.08)'
  return 'rgba(239, 68, 68, 0.08)'
}

function ProgressBar({ metric, delay }: { metric: BehavioralMetric; delay: number }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(metric.value !== null ? metric.value : 0)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [metric.value, delay])

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="alpha-body text-[#D1D5DB] font-medium">{metric.label}</span>
          <span className="alpha-caption text-[#6B7280] hidden sm:inline">{metric.description}</span>
        </div>
        <span
          className="font-financial text-sm font-semibold"
          style={{ color: metric.value !== null ? getBarColor(metric.value) : '#6B7280' }}
        >
          {metric.value !== null ? `${metric.value}%` : '—'}
        </span>
      </div>
      <div
        ref={ref}
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: getBarBgColor(metric.value) }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: getBarColor(metric.value),
            boxShadow: metric.value !== null && metric.value >= 70
              ? '0 0 12px rgba(34, 197, 94, 0.3)'
              : metric.value !== null && metric.value >= 40
                ? '0 0 12px rgba(245, 158, 11, 0.3)'
                : metric.value !== null
                  ? '0 0 12px rgba(239, 68, 68, 0.3)'
                  : 'none',
          }}
        />
      </div>
    </div>
  )
}

export function PerformancePatterns({
  bestSetup, bestSession, bestRiskReward, bestPair,
  worstSetup, worstSession, isLoading,
}: PerformancePatternsProps) {
  // Behavioral metrics — derived from available data
  // These will show as N/A until the API provides behavioral scores
  const behavioralMetrics: BehavioralMetric[] = [
    { label: 'Early Exit', value: null, description: 'Tendency to close trades early' },
    { label: 'FOMO', value: null, description: 'Fear of missing out entries' },
    { label: 'Risk Management', value: null, description: 'Risk/reward discipline' },
    { label: 'Consistency', value: null, description: 'Trading plan adherence' },
  ]

  // Existing pattern data
  const patterns = [
    { icon: BookOpen, label: 'Best Setup', value: bestSetup, isWorst: false },
    { icon: Clock, label: 'Best Session', value: bestSession ? SESSION_LABELS[bestSession] || bestSession : null, isWorst: false },
    { icon: Target, label: 'Best R:R', value: bestRiskReward, isWorst: false },
    { icon: BarChart3, label: 'Best Pair', value: bestPair, isWorst: false },
    { icon: XCircle, label: 'Worst Setup', value: worstSetup, isWorst: true },
    { icon: X, label: 'Worst Session', value: worstSession ? SESSION_LABELS[worstSession] || worstSession : null, isWorst: true },
  ]

  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
        <Skeleton className="mb-6 h-5 w-48 bg-[#1E2030]" />
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40 bg-[#1E2030]" />
              <Skeleton className="h-2 w-full bg-[#1E2030]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366F1]/10">
          <Activity size={15} className="text-[#6366F1]" />
        </div>
        <h3 className="alpha-heading-sm uppercase tracking-wider text-[#F3F4F6]">
          BEHAVIORAL PROFILE
        </h3>
      </div>

      {/* ── Progress Bars ── */}
      <div className="mb-8 space-y-5">
        {behavioralMetrics.map((metric, i) => (
          <ProgressBar key={metric.label} metric={metric} delay={0.3 + i * 0.12} />
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="mb-6 h-px bg-gradient-to-r from-[#232636] via-[#232636]/50 to-transparent" />

      {/* ── Pattern Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {patterns.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className={`rounded-xl border px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 ${
                card.isWorst
                  ? 'border-red-500/10 bg-[#0B0D17]/50 hover:border-red-500/20 hover:bg-red-500/[0.03]'
                  : 'border-emerald-500/10 bg-[#0B0D17]/50 hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]'
              }`}
            >
              <Icon
                size={13}
                className={card.isWorst ? 'mb-2 text-red-400/50' : 'mb-2 text-emerald-500/70'}
              />
              <p className="alpha-caption mb-0.5 text-[#6B7280]">{card.label}</p>
              <p className={`alpha-label font-semibold ${
                card.isWorst
                  ? card.value ? 'text-red-400' : 'text-[#4B5563]'
                  : card.value ? 'text-emerald-400' : 'text-[#4B5563]'
              }`}
              >
                {card.value || '—'}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
