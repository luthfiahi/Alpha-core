'use client'

import { motion } from 'framer-motion'
import { Brain, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AISummaryProps {
  aiSummary: string | null
  updatedAt: string | null
  isGenerating: boolean
  onRegenerate: () => void
  isLoading: boolean
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

export function AISummary({ aiSummary, updatedAt, isGenerating, onRegenerate, isLoading }: AISummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
        <Skeleton className="mb-4 h-5 w-36 bg-[#1E2030]" />
        <div className="space-y-2">
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
      className="alpha-animate-in relative overflow-hidden rounded-[14px] border border-[#6366F1]/25 bg-[#151827] p-6"
    >
      {/* Gradient accent bar at top */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366F1] to-transparent" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-[#6366F1]" />
          <h3 className="alpha-heading-sm text-[#F3F4F6]">Ringkasan AI</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="gap-1.5 alpha-label text-[#6366F1] hover:bg-[#6366F1]/10 hover:text-[#818CF8] alpha-press"
        >
          <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Generating...' : 'Regenerate DNA'}
        </Button>
      </div>

      {aiSummary ? (
        <p className="mb-4 alpha-body leading-relaxed text-[#D1D5DB]">
          {aiSummary}
        </p>
      ) : (
        <p className="mb-4 alpha-body text-[#6B7280]">
          DNA belum di-generate. Klik &quot;Regenerate DNA&quot; untuk memulai analisis.
        </p>
      )}

      <div className="flex items-center gap-1.5 alpha-caption text-[#4B5563]">
        <Clock size={12} />
        <span>Terakhir diperbarui: {formatTimeAgo(updatedAt)}</span>
      </div>
    </motion.div>
  )
}
