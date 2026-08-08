'use client'

import { motion } from 'framer-motion'
import { Brain, RefreshCw, Clock, Sparkles, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AISummaryProps {
  aiSummary: string | null
  updatedAt: string | null
  isGenerating: boolean
  onRegenerate: () => void
  isLoading: boolean
  totalTrades?: number
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Baru saja'
  try {
    const now = new Date()
    const then = new Date(dateStr)
    const diffMs = now.getTime() - then.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Baru saja'
    if (diffMin < 60) return `${diffMin} menit lalu`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr} jam lalu`
    const diffDay = Math.floor(diffHr / 24)
    return `${diffDay} hari lalu`
  } catch {
    return 'Baru saja'
  }
}

export function AISummary({ aiSummary, updatedAt, isGenerating, onRegenerate, isLoading, totalTrades }: AISummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
        <Skeleton className="mb-4 h-5 w-40 bg-[#1E2030]" />
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full bg-[#1E2030]" />
          <Skeleton className="h-4 w-full bg-[#1E2030]" />
          <Skeleton className="h-4 w-3/4 bg-[#1E2030]" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="alpha-animate-in relative overflow-hidden rounded-[14px] border border-[#232636] bg-[#151827]"
    >
      {/* Subtle indigo left border accent */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#6366F1] via-[#818CF8] to-[#6366F1]/30" />

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366F1]/[0.03] via-transparent to-transparent" />

      <div className="relative p-6 pl-8">
        {/* ── Header ── */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366F1]/10">
              <Sparkles size={14} className="text-[#6366F1]" />
            </div>
            <h3 className="alpha-heading-sm uppercase tracking-wider text-[#F3F4F6]">
              ALPHA SUMMARY
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="gap-1.5 alpha-label text-[#6B7280] hover:text-[#818CF8] hover:bg-[#6366F1]/8 alpha-press"
          >
            <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Analyzing...' : 'Regenerate'}
          </Button>
        </div>

        {/* ── Summary Content ── */}
        {aiSummary ? (
          <div className="prose prose-sm prose-invert max-w-none mb-5">
            <p className="alpha-body leading-relaxed text-[#D1D5DB] whitespace-pre-line">
              {aiSummary}
            </p>
          </div>
        ) : (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-dashed border-[#232636] bg-[#0B0D17]/50 px-4 py-5">
            <Brain size={18} className="shrink-0 text-[#6B7280]" />
            <p className="alpha-body text-[#6B7280]">
              DNA belum di-generate. Klik &quot;Regenerate&quot; untuk memulai analisis AI.
            </p>
          </div>
        )}

        {/* ── Footer Attribution ── */}
        <div className="flex items-center justify-between border-t border-[#232636]/60 pt-3">
          {totalTrades !== undefined && totalTrades > 0 ? (
            <div className="flex items-center gap-1.5 text-[#4B5563]">
              <Database size={11} />
              <span className="alpha-caption">Based on {totalTrades} trades</span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-1.5 text-[#4B5563]">
            <Clock size={11} />
            <span className="alpha-caption">{formatTimeAgo(updatedAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
