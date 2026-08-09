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
  if (score <= 40) return '0 0 24px rgba(239,68,68,0.3)'
  if (score <= 60) return '0 0 24px rgba(245,158,11,0.3)'
  if (score <= 80) return '0 0 24px rgba(99,102,241,0.3)'
  return '0 0 24px rgba(34,197,94,0.3)'
}

function getRingGradient(score: number): { start: string; end: string } {
  if (score <= 40) return { start: '#EF4444', end: '#F87171' }
  if (score <= 60) return { start: '#F59E0B', end: '#FBBF24' }
  if (score <= 80) return { start: '#6366F1', end: '#818CF8' }
  return { start: '#22C55E', end: '#4ADE80' }
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

function getConsistencyLabel(score: number): string {
  if (score > 80) return 'Sangat Konsisten'
  if (score > 60) return 'Konsisten'
  if (score > 40) return 'Perlu Diperbaiki'
  return 'Tidak Konsisten'
}

export function ProcessScoreCard({ score, previousScore }: ProcessScoreCardProps) {
  const hasData = score !== null
  const displayScore = score ?? 0
  const color = getScoreColor(displayScore)
  const bgColor = getScoreBg(displayScore)
  const glow = getScoreGlow(displayScore)
  const ringGrad = getRingGradient(displayScore)

  // Ring math — 160px diameter -> radius = 80 - strokeWidth/2 = 74
  const ringSize = 160
  const strokeWidth = 12
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = displayScore / 100
  const strokeDashoffset = circumference * (1 - progress)

  // 7-day trend diff
  let trendDiff: string | null = null
  if (previousScore !== null && score !== null) {
    const diff = score - previousScore
    if (diff !== 0) {
      const sign = diff > 0 ? '\u2191 +' : '\u2193 '
      trendDiff = `${sign}${Math.abs(diff)}`
    }
  }

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
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* SVG Ring — dashed, static */}
          <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
            {/* Radial glow background */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
              }}
            />
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
              <span className="alpha-label mb-1" style={{ color: '#6B7280' }}>PROCESS SCORE</span>
              <span
                className="font-financial text-[42px] font-bold leading-none"
                style={{ color: '#4B5563' }}
              >
                —
              </span>
              <span className="text-xs mt-1.5" style={{ color: '#4B5563' }}>Belum cukup data</span>
            </div>
          </div>

          {/* Insight area */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <span className="alpha-label mb-2" style={{ color: '#6B7280' }}>INSIGHT</span>
            <p className="alpha-body text-[#9CA3AF] leading-relaxed">
              Catat trade pertamamu untuk mulai melihat Process Score dan rekomendasi dari Alpha.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="alpha-card p-6">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Left: Ring + labels */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span className="alpha-label mb-3" style={{ color: '#6B7280' }}>PROCESS SCORE</span>
          <div className="relative" style={{ width: ringSize, height: ringSize }}>
            {/* Radial glow background */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${bgColor} 0%, transparent 70%)`,
              }}
            />
            <svg
              className="process-score-ring"
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              style={{ filter: `drop-shadow(${glow})` }}
            >
              <defs>
                <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ringGrad.start} />
                  <stop offset="100%" stopColor={ringGrad.end} />
                </linearGradient>
              </defs>
              {/* Background ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="#232636"
                strokeWidth={strokeWidth}
              />
              {/* Progress ring with dynamic gradient */}
              <motion.circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="url(#ring-gradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              />
            </svg>
            {/* Score in center with 7-day trend */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-financial text-[44px] font-bold leading-none"
                style={{ color }}
              >
                {displayScore}
              </span>
              {trendDiff && (
                <span
                  className="text-[11px] font-financial font-semibold mt-1"
                  style={{
                    color: score! > previousScore! ? '#22C55E' : '#EF4444',
                    opacity: 0.8,
                  }}
                >
                  {trendDiff}
                </span>
              )}
            </div>
          </div>
          {/* Mini stat chips below ring */}
          <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ color, backgroundColor: bgColor }}
            >
              {getRatingText(displayScore)}
            </span>
            {trendLabel && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ color: '#9CA3AF', backgroundColor: 'rgba(156,163,175,0.08)' }}
              >
                {trendLabel}
              </span>
            )}
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ color: '#9CA3AF', backgroundColor: 'rgba(156,163,175,0.08)' }}
            >
              {getConsistencyLabel(displayScore)}
            </span>
          </div>
        </div>

        {/* Right: Insight text */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span className="alpha-label mb-2" style={{ color: '#6B7280' }}>INSIGHT</span>
          <p className="alpha-body leading-relaxed">
            {getInsightText(displayScore)}
          </p>
        </div>
      </div>
    </div>
  )
}