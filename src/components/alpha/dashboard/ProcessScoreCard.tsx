'use client'

import { motion } from 'framer-motion'

interface ProcessScoreCardProps {
  score: number | null
  previousScore: number | null
}

function getScoreColor(score: number): string {
  if (score <= 40) return '#EF4444'
  if (score <= 60) return '#F59E0B'
  if (score <= 80) return '#6366F1'
  return '#22C55E'
}

function getScoreBg(score: number): string {
  if (score <= 40) return 'rgba(239,68,68,0.1)'
  if (score <= 60) return 'rgba(245,158,11,0.1)'
  if (score <= 80) return 'rgba(99,102,241,0.1)'
  return 'rgba(34,197,94,0.1)'
}

export function ProcessScoreCard({ score, previousScore }: ProcessScoreCardProps) {
  const displayScore = score ?? 0
  const color = getScoreColor(displayScore)
  const bgColor = getScoreBg(displayScore)

  // Ring math
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const progress = displayScore / 100
  const strokeDashoffset = circumference * (1 - progress)

  // Trend
  let trendLabel: string | null = null
  let trendUp = false
  if (previousScore !== null && score !== null) {
    const diff = score - previousScore
    if (diff !== 0) {
      trendUp = diff > 0
      trendLabel = `${trendUp ? '+' : ''}${diff} pts (${trendUp ? '↑' : '↓'})`
    } else {
      trendLabel = 'Stabil (→)'
    }
  }

  return (
    <div className="alpha-card p-6">
      <div className="flex items-center gap-6">
        {/* SVG Ring */}
        <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
          <svg
            className="process-score-ring"
            width={120}
            height={120}
            viewBox="0 0 120 120"
          >
            {/* Background ring */}
            <circle
              cx={60}
              cy={60}
              r={radius}
              fill="none"
              stroke="#232636"
              strokeWidth={8}
            />
            {/* Progress ring */}
            <motion.circle
              cx={60}
              cy={60}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            />
          </svg>
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-financial text-[32px] font-bold leading-none"
              style={{ color }}
            >
              {displayScore}
            </span>
          </div>
        </div>

        {/* Label area */}
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-1">
            Process Score
          </h3>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit"
            style={{
              color,
              backgroundColor: bgColor,
            }}
          >
            {trendLabel ? (
              <>
                <span>{trendLabel}</span>
              </>
            ) : (
              <span>No prior data</span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] mt-2">
            {displayScore <= 40
              ? 'Perlu perhatian segera'
              : displayScore <= 60
                ? 'Cukup baik, terus tingkatkan'
                : displayScore <= 80
                  ? 'Proses trading baik'
                  : 'Excellent! Pertahankan.'}
          </p>
        </div>
      </div>
    </div>
  )
}
