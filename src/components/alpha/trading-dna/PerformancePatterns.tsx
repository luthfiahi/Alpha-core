'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, BarChart3, XCircle, X } from 'lucide-react'
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

interface PatternCard {
  icon: React.ElementType
  label: string
  value: string | null
  isWorst: boolean
  delay: number
  staggerClass: string
}

export function PerformancePatterns({
  bestSetup, bestSession, bestRiskReward, bestPair,
  worstSetup, worstSession, isLoading,
}: PerformancePatternsProps) {
  const cards: PatternCard[] = [
    { icon: BookOpen, label: 'Setup Terbaik', value: bestSetup, isWorst: false, delay: 0.2, staggerClass: 'alpha-stagger-1' },
    { icon: Clock, label: 'Session Terbaik', value: bestSession ? SESSION_LABELS[bestSession] || bestSession : null, isWorst: false, delay: 0.25, staggerClass: 'alpha-stagger-2' },
    { icon: Target, label: 'R:R Terbaik', value: bestRiskReward, isWorst: false, delay: 0.3, staggerClass: 'alpha-stagger-3' },
    { icon: BarChart3, label: 'Pair Terbaik', value: bestPair, isWorst: false, delay: 0.35, staggerClass: 'alpha-stagger-4' },
    { icon: XCircle, label: 'Setup Terburuk', value: worstSetup, isWorst: true, delay: 0.4, staggerClass: 'alpha-stagger-5' },
    { icon: X, label: 'Session Terburuk', value: worstSession ? SESSION_LABELS[worstSession] || worstSession : null, isWorst: true, delay: 0.45, staggerClass: 'alpha-stagger-6' },
  ]

  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
        <Skeleton className="mb-5 h-5 w-40 bg-[#1E2030]" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-[#1E2030]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 size={16} className="text-[#6366F1]" />
        <h3 className="alpha-heading-sm text-[#F3F4F6]">Pola Performa</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: card.delay, ease: [0.4, 0, 0.2, 1] }}
              className={`alpha-animate-in ${card.staggerClass} alpha-card-glow alpha-press rounded-xl border p-4 transition-colors ${
                card.isWorst
                  ? 'border-red-500/15 bg-[#10121E]'
                  : 'border-emerald-500/15 bg-[#10121E]'
              } hover:bg-[#1E2030]`}
            >
              <Icon
                size={16}
                className={card.isWorst ? 'mb-2 text-red-400/60' : 'mb-2 text-emerald-500'}
              />
              <p className="alpha-caption mb-1">{card.label}</p>
              <p className={`alpha-body font-semibold ${
                card.isWorst
                  ? card.value ? 'text-red-400' : 'text-[#4B5563]'
                  : card.value ? 'text-emerald-400' : 'text-[#4B5563]'
              }`}
              >
                {card.value || 'Belum ada data'}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
