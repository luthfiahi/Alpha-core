'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Shield, ShieldAlert } from 'lucide-react'
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
        <Skeleton className="mb-4 h-5 w-36 bg-[#1E2030]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full bg-[#1E2030]" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full bg-[#1E2030]" />
            ))}
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
      className="rounded-[14px] border border-[#232636] bg-[#151827] p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Shield size={18} className="text-[#6366F1]" />
        <h3 className="text-sm font-semibold text-[#F3F4F6]">Kekuatan & Kelemahan</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Shield size={14} className="text-emerald-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Kekuatan
            </h4>
          </div>
          <div className="space-y-2">
            {strengths.length > 0
              ? strengths.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-2.5 rounded-lg bg-[#10121E] px-3 py-2.5"
                  >
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <p className="text-sm text-[#D1D5DB]">{s}</p>
                  </motion.div>
                ))
              : (
                <p className="text-sm text-[#6B7280]">Belum ada data</p>
              )}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Kelemahan
            </h4>
          </div>
          <div className="space-y-2">
            {weaknesses.length > 0
              ? weaknesses.map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                    className="flex items-start gap-2.5 rounded-lg bg-[#10121E] px-3 py-2.5"
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <p className="text-sm text-[#D1D5DB]">{w}</p>
                  </motion.div>
                ))
              : (
                <p className="text-sm text-[#6B7280]">Belum ada data</p>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
