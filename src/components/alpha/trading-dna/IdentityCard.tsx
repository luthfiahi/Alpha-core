'use client'

import { motion } from 'framer-motion'
import { Dna, Zap, Brain, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

const EMOTION_CONFIG: Record<string, { label: string; color: string }> = {
  FEAR: { label: 'Fear', color: 'text-red-400' },
  GREED: { label: 'Greed', color: 'text-amber-400' },
  PATIENCE: { label: 'Patience', color: 'text-emerald-400' },
  DISCIPLINE: { label: 'Discipline', color: 'text-[#6366F1]' },
  ANXIETY: { label: 'Anxiety', color: 'text-orange-400' },
  CONFIDENCE: { label: 'Confidence', color: 'text-cyan-400' },
}

export function IdentityCard({ tradingStyle, dominantEmotion, totalTradesAnalyzed, analysisPeriod, isLoading }: IdentityCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
        <Skeleton className="mb-4 h-5 w-32 bg-[#1E2030]" />
        <Skeleton className="mb-3 h-10 w-full bg-[#1E2030]" />
        <Skeleton className="mb-3 h-8 w-3/4 bg-[#1E2030]" />
        <Skeleton className="h-8 w-1/2 bg-[#1E2030]" />
      </div>
    )
  }

  const styleLabel = tradingStyle ? STYLE_LABELS[tradingStyle] || tradingStyle : 'Belum teridentifikasi'
  const emotionConfig = dominantEmotion ? EMOTION_CONFIG[dominantEmotion] || { label: dominantEmotion, color: 'text-[#9CA3AF]' } : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-[14px] border border-[#232636] bg-[#151827] p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Dna size={18} className="text-[#6366F1]" />
        <h3 className="text-sm font-semibold text-[#F3F4F6]">Identitas Trading</h3>
      </div>

      {/* Trading Style */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#10121E] px-4 py-3">
        <Zap size={20} className="text-[#6366F1]" />
        <div>
          <p className="text-xs text-[#6B7280]">Trading Style</p>
          <Badge variant="secondary" className="mt-1 border-[#6366F1]/30 bg-[#6366F1]/12 text-[#6366F1]">
            {styleLabel}
          </Badge>
        </div>
      </div>

      {/* Dominant Emotion */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#10121E] px-4 py-3">
        <Brain size={20} className={emotionConfig?.color || 'text-[#6B7280]'} />
        <div>
          <p className="text-xs text-[#6B7280]">Emosi Dominan</p>
          <p className={`mt-0.5 text-sm font-semibold ${emotionConfig?.color || 'text-[#9CA3AF]'}`}>
            {emotionConfig?.label || 'Belum teridentifikasi'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#10121E] px-3 py-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-[#6B7280]" />
            <p className="text-xs text-[#6B7280]">Total Trades</p>
          </div>
          <p className="mt-1 text-lg font-bold text-[#F3F4F6]">
            {totalTradesAnalyzed || 0}
          </p>
        </div>
        <div className="rounded-lg bg-[#10121E] px-3 py-3">
          <p className="text-xs text-[#6B7280]">Periode</p>
          <p className="mt-1 text-sm font-semibold text-[#9CA3AF]">
            {analysisPeriod || 'N/A'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
