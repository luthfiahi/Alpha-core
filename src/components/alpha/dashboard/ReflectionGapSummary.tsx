'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, PenLine } from 'lucide-react'

interface ReflectionGapSummaryProps {
  unreflectedCount: number
}

export function ReflectionGapSummary({ unreflectedCount }: ReflectionGapSummaryProps) {
  const hasGaps = unreflectedCount > 0

  return (
    <div className="alpha-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: hasGaps
                ? 'rgba(245,158,11,0.15)'
                : 'rgba(34,197,94,0.15)',
            }}
          >
            <AlertTriangle
              className="h-4 w-4"
              style={{ color: hasGaps ? '#F59E0B' : '#22C55E' }}
            />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F4F6]">
            Reflection Gap
          </h3>
        </div>

        {hasGaps ? (
          <>
            <p className="text-sm text-[#9CA3AF] mb-1">
              <span
                className="font-financial font-bold text-base"
                style={{ color: '#F59E0B' }}
              >
                {unreflectedCount}
              </span>{' '}
              trade belum di-reflection minggu ini.
            </p>
            <p className="text-xs text-[#6B7280]">
              Refleksi membantu kamu belajar dari setiap keputusan trading.
            </p>
          </>
        ) : (
          <p className="text-sm text-[#22C55E]">
            Semua trade sudah di-reflection minggu ini. Pertahankan!
          </p>
        )}
      </div>

      {hasGaps && (
        <Button
          variant="secondary"
          className="mt-4 gap-2 w-full h-9 text-sm font-medium"
          style={{
            backgroundColor: 'rgba(245,158,11,0.12)',
            color: '#F59E0B',
            borderColor: 'rgba(245,158,11,0.25)',
          }}
        >
          <PenLine className="h-3.5 w-3.5" />
          Isi Reflection
        </Button>
      )}
    </div>
  )
}
