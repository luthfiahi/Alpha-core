'use client'

import { motion } from 'framer-motion'
import { Zap, Brain, BarChart3, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface IdentityCardProps {
  tradingStyle: string | null
  dominantEmotion: string | null
  totalTradesAnalyzed: number
  analysisPeriod: string | null
  isLoading: boolean
}

const STYLE_LABELS: Record<string, string> = {
  SCALPER: 'Scalper',
  DAY_TRADER: 'Day Trader',
  SWING: 'Swing Trader',
  POSITION: 'Position Trader',
}

const EMOTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  FEAR: { label: 'Fear', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  GREED: { label: 'Greed', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  PATIENCE: { label: 'Patience', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  DISCIPLINE: { label: 'Discipline', color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/20' },
  ANXIETY: { label: 'Anxiety', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  CONFIDENCE: { label: 'Confidence', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
}

const HEX_VERTICES = [
  { x: 100, y: 28 },
  { x: 164, y: 64 },
  { x: 164, y: 136 },
  { x: 100, y: 172 },
  { x: 36, y: 136 },
  { x: 36, y: 64 },
]

const COLOR_MAP: Record<string, string> = {
  'red-400': '#F87171',
  'amber-400': '#FBBF24',
  'emerald-400': '#34D399',
  '[#6366F1]': '#6366F1',
  'orange-400': '#FB923C',
  'cyan-400': '#22D3EE',
}

function HexVisualization({ dominantEmotion }: { dominantEmotion: string | null }) {
  const emotionConfig = dominantEmotion ? EMOTION_CONFIG[dominantEmotion] : null
  const accentColor = emotionConfig?.color?.replace('text-', '') || '#6366F1'
  const resolvedColor = COLOR_MAP[accentColor] || '#6366F1'

  const vertexDots = HEX_VERTICES.map((p, i) => (
    <circle
      key={`dot-${i}`}
      cx={p.x}
      cy={p.y}
      r="2.5"
      fill={resolvedColor}
      opacity={0.35 + (i % 2) * 0.15}
    />
  ))

  const connectingLines = HEX_VERTICES.map((p, i) => (
    <line
      key={`line-${i}`}
      x1="100"
      y1="100"
      x2={p.x}
      y2={p.y}
      stroke={resolvedColor}
      strokeWidth="0.5"
      strokeOpacity="0.08"
      strokeDasharray="4 4"
    />
  ))

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute h-56 w-56 rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, ${resolvedColor}, transparent 70%)` }}
      />
      <svg
        viewBox="0 0 200 200"
        className="relative h-48 w-48 sm:h-56 sm:w-56"
        fill="none"
      >
        <defs>
          <linearGradient id="hexGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="hexGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity="0.02" />
          </linearGradient>
          <filter id="hexGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer hexagon */}
        <polygon
          points="100,8 184,54 184,146 100,192 16,146 16,54"
          stroke={resolvedColor}
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="url(#hexGrad1)"
        />

        {/* Middle hexagon */}
        <polygon
          points="100,28 164,64 164,136 100,172 36,136 36,64"
          stroke={resolvedColor}
          strokeWidth="0.5"
          strokeOpacity="0.2"
          fill="url(#hexGrad2)"
        />

        {/* Inner hexagon */}
        <polygon
          points="100,52 140,76 140,124 100,148 60,124 60,76"
          stroke={resolvedColor}
          strokeWidth="0.5"
          strokeOpacity="0.15"
          fill="none"
        />

        {/* Center dot with glow */}
        <circle cx="100" cy="100" r="6" fill={resolvedColor} opacity="0.6" filter="url(#hexGlow)" />
        <circle cx="100" cy="100" r="3" fill={resolvedColor} opacity="0.9" />

        {/* Orbital dots on vertices */}
        {vertexDots}

        {/* Connecting lines from center */}
        {connectingLines}

        {/* DNA label in center */}
        <text
          x="100"
          y="105"
          textAnchor="middle"
          fill={resolvedColor}
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          opacity="0.7"
          letterSpacing="0.1em"
        >
          DNA
        </text>
      </svg>
    </div>
  )
}

export function IdentityCard({ tradingStyle, dominantEmotion, totalTradesAnalyzed, analysisPeriod, isLoading }: IdentityCardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[14px] border border-[#232636] bg-[#151827] p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 bg-[#1E2030]" />
            <Skeleton className="h-12 w-64 bg-[#1E2030]" />
            <Skeleton className="h-4 w-40 bg-[#1E2030]" />
            <div className="flex gap-6 pt-2">
              <Skeleton className="h-16 w-28 bg-[#1E2030]" />
              <Skeleton className="h-16 w-28 bg-[#1E2030]" />
            </div>
          </div>
          <Skeleton className="h-56 w-56 rounded-full bg-[#1E2030]" />
        </div>
      </div>
    )
  }

  const styleLabel = tradingStyle ? STYLE_LABELS[tradingStyle] || tradingStyle : 'Belum teridentifikasi'
  const emotionConfig = dominantEmotion ? EMOTION_CONFIG[dominantEmotion] || { label: dominantEmotion, color: 'text-[#9CA3AF]', bg: 'bg-[#6B7280]/10', border: 'border-[#6B7280]/20' } : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="alpha-card-glow alpha-press relative overflow-hidden rounded-[14px] border border-[#232636] bg-[#151827]"
    >
      {/* Gradient header strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#A78BFA]" />
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366F1]/[0.04] via-transparent to-[#8B5CF6]/[0.03]" />
      {/* Subtle diamond pattern background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(99,102,241,1) 35px, rgba(99,102,241,1) 36px), repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(99,102,241,1) 35px, rgba(99,102,241,1) 36px)' }} />

      <div className="relative p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Left: Stats Grid */}
          <div className="space-y-6">
            {/* Trading Style — hero stat */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-[#6366F1]" />
                <span className="alpha-caption uppercase tracking-wider">Trading Style</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F4F6]">
                {styleLabel}
              </h2>
            </div>

            {/* Dominant Trait — color-coded */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-[#6B7280]" />
                <span className="alpha-caption uppercase tracking-wider">Dominant Trait</span>
              </div>
              {emotionConfig ? (
                <div className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-2 alpha-badge-interactive ${emotionConfig.bg} ${emotionConfig.border}`}>
                  <div className={`h-2.5 w-2.5 rounded-full ${emotionConfig.color}`} style={{ backgroundColor: 'currentColor' }} />
                  <span className={`alpha-heading-xs font-semibold ${emotionConfig.color}`}>
                    {emotionConfig.label}
                  </span>
                </div>
              ) : (
                <span className="alpha-body text-[#6B7280]">Belum teridentifikasi</span>
              )}
            </div>

            {/* Stats row: Total Trades + Period — with subtle divider */}
            <div className="flex items-end gap-8 border-t border-[#232636]/50 mt-2 pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <BarChart3 size={14} className="text-[#6B7280]" />
                  <span className="alpha-caption uppercase tracking-wider">Total Trades</span>
                </div>
                <p className="font-financial text-4xl font-bold text-[#F3F4F6]">
                  {totalTradesAnalyzed || 0}
                </p>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar size={14} className="text-[#6B7280]" />
                  <span className="alpha-caption uppercase tracking-wider">Period</span>
                </div>
                <p className="alpha-body font-semibold text-[#9CA3AF]">
                  {analysisPeriod || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Hexagonal Visualization */}
          <div className="hidden lg:flex">
            <HexVisualization dominantEmotion={dominantEmotion} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
