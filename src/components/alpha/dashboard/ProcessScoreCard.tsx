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

function getScoreGlow(score: number): string {
  if (score <= 40) return '0 0 20px rgba(239,68,68,0.25)'
  if (score <= 60) return '0 0 20px rgba(245,158,11,0.25)'
  if (score <= 80) return '0 0 20px rgba(99,102,241,0.25)'
  return '0 0 20px rgba(34,197,94,0.25)'
}

function getRatingText(score: number): string {
  if (score > 80) return 'Excellent'
  if (score > 60) return 'Good'
  if (score > 40) return 'Fair'
  return 'Needs Attention'
}

function getInsightText(score: number): string {
  if (score > 80) return 'Alpha melihat peningkatan konsistensi prosesmu minggu ini. Pertahankan disiplin ini.'
  if (score > 60) return 'Proses tradingmu menunjukkan perkembangan positif. Fokus pada area yang masih bisa ditingkatkan.'
  if (score > 40) return 'Ada ruang perbaikan di proses tradingmu. Perhatikan aspek disiplin dan manajemen risiko.'
  return 'Perlu perhatian ekstra pada proses trading. Fokus kembali pada trading plan dan disiplin eksekusi.'
}

export function ProcessScoreCard({ score, previousScore }: ProcessScoreCardProps) {
  const hasData = score !== null
  const displayScore = score ?? 0
  const color = getScoreColor(displayScore)
  const bgColor = getScoreBg(displayScore)
  const glow = getScoreGlow(displayScore)

  // Ring math — 140px diameter → radius = 70 - strokeWidth/2 = 56
  const ringSize = 140
  const strokeWidth = 10
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = displayScore / 100
  const strokeDashoffset = circumference * (1 - progress)

  // Trend
  let trendLabel: string | null = null
  if (previousScore !== null && score !== null) {
    const diff = score - previousScore
    if (diff !== 0) {
      const pct = previousScore !== 0 ? ((diff / previousScore) * 100).toFixed(1) : '0.0'
      const sign = diff > 0 ? '+' : ''
      trendLabel = `${sign}${pct}% dari minggu lalu`
    } else {
      trendLabel = 'Stabil dari minggu lalu'
    }
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="alpha-card p-6">
        <div className="flex items-center gap-8">
          {/* SVG Ring — dashed, static */}
          <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
            <svg
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
            >
              {/* Dashed background ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="#232636"
                strokeWidth={strokeWidth}
                strokeDasharray="8 6"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="alpha-label mb-1">PROCESS SCORE</span>
              <span
                className="font-financial text-[36px] font-bold leading-none"
                style={{ color: '#4B5563' }}
              >
                —
              </span>
              <span className="text-xs text-[#4B5563] mt-1.5">Belum cukup data</span>
            </div>
          </div>

          {/* Insight area */}
          <div className="flex flex-col justify-center min-w-0">
            <p className="alpha-body text-[#9CA3AF]">
              Catat trade pertamamu untuk mulai melihat Process Score dan rekomendasi dari Alpha.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="alpha-card p-6">
      <div className="flex items-center gap-8">
        {/* Left: Ring + labels */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span className="alpha-label mb-2">PROCESS SCORE</span>
          <div className="relative" style={{ width: ringSize, height: ringSize }}>
            <svg
              className="process-score-ring"
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              style={{ filter: `drop-shadow(${glow})` }}
            >
              {/* Background ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="#232636"
                strokeWidth={strokeWidth}
              />
              {/* Progress ring */}
              <motion.circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
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
                className="font-financial text-[36px] font-bold leading-none"
                style={{ color }}
              >
                {displayScore}
              </span>
            </div>
          </div>
          {/* Below ring: rating + trend */}
          <div className="mt-3 flex flex-col items-center">
            <span
              className="text-sm font-semibold"
              style={{ color }}
            >
              {getRatingText(displayScore)}
            </span>
            {trendLabel && (
              <span className="alpha-caption mt-0.5">
                {trendLabel}
              </span>
            )}
          </div>
        </div>

        {/* Right: Insight text */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <p className="alpha-body leading-relaxed">
            {getInsightText(displayScore)}
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit mt-3"
            style={{
              color,
              backgroundColor: bgColor,
            }}
          >
            {displayScore <= 40
              ? 'Fokus pada disiplin proses'
              : displayScore <= 60
                ? 'Proses cukup baik'
                : displayScore <= 80
                  ? 'Proses trading baik'
                  : 'Pertahankan konsistensi'}
          </div>
        </div>
      </div>
    </div>
  )
}