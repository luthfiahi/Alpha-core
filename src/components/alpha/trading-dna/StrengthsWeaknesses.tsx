'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface StrengthsWeaknessesProps {
  strengths: string[]
  weaknesses: string[]
  isLoading: boolean
}

export function StrengthsWeaknesses({ strengths, weaknesses, isLoading }: StrengthsWeaknessesProps) {
  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-[#232636] bg-[#151827] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-[#1E2030]" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full bg-[#1E2030]" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-[#1E2030]" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-32 rounded-full bg-[#1E2030]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="alpha-animate-in rounded-[14px] border border-[#232636] bg-[#151827] p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Strengths ── */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
              <TrendingUp size={13} className="text-emerald-500" />
            </div>
            <h4 className="alpha-heading-xs text-emerald-500">
              STRENGTHS
            </h4>
            <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-emerald-500/15 border border-emerald-500/25 px-1.5 text-[10px] font-bold text-emerald-400">
              {strengths.length}
            </span>
          </div>
          {strengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strengths.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="alpha-badge-interactive group inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3.5 py-1.5 transition-colors hover:border-emerald-500/35 hover:bg-emerald-500/[0.12]"
                >
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span className="alpha-label text-emerald-300">{s}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="alpha-body text-[#6B7280]">Belum ada data</p>
          )}
        </div>

        {/* ── Weaknesses ── */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10">
              <TrendingDown size={13} className="text-red-500" />
            </div>
            <h4 className="alpha-heading-xs text-red-400">
              WEAKNESSES
            </h4>
            <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500/15 border border-red-500/25 px-1.5 text-[10px] font-bold text-red-400">
              {weaknesses.length}
            </span>
          </div>
          {weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.2 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="alpha-badge-interactive group inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/[0.08] px-3.5 py-1.5 transition-colors hover:border-red-500/35 hover:bg-red-500/[0.12]"
                >
                  <AlertTriangle size={12} className="text-red-400" />
                  <span className="alpha-label text-red-300">{w}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="alpha-body text-[#6B7280]">Belum ada data</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
