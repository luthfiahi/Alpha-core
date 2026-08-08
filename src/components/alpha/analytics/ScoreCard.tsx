'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScoreCardProps {
  label: string
  score: number | null
  diff: number | null
  trend: 'up' | 'down' | 'stable'
  color: string
  icon?: React.ReactNode
}

export function ScoreCard({ label, score, diff, trend, color, icon }: ScoreCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-[#6B7280]'

  const bgColor = `${color}15`

  return (
    <motion.div
      className="bg-[#151827] border border-[#232636] rounded-[14px] p-4 hover:bg-[#1E2030] transition-colors alpha-press"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <span style={{ color }}>{icon}</span>
            </div>
          )}
          <span className="alpha-label text-[#9CA3AF]">{label}</span>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {diff !== null && (
            <span className="text-xs font-financial font-medium">
              {diff > 0 ? '+' : ''}{diff}
            </span>
          )}
        </div>
      </div>
      <div className="font-financial text-2xl font-bold" style={{ color: score !== null && score !== undefined ? color : '#4B5563' }}>
        {score !== null && score !== undefined ? score : '—'}
      </div>
    </motion.div>
  )
}
