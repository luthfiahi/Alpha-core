'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, PenLine } from 'lucide-react'
import { useNavigationStore } from '@/stores'

interface ReflectionGapSummaryProps {
  unreflectedCount: number
}

export function ReflectionGapSummary({ unreflectedCount }: ReflectionGapSummaryProps) {
  const hasGaps = unreflectedCount > 0
  const navigate = useNavigationStore((s) => s.navigate)

  return (
    <div className="alpha-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: hasGaps
                ? 'rgba(245,158,11,0.12)'
                : 'rgba(34,197,94,0.12)',
            }}
          >
            {hasGaps ? (
              <AlertTriangle
                className="h-4 w-4"
                style={{ color: '#F59E0B' }}
              />
            ) : (
              <CheckCircle2
                className="h-4 w-4"
                style={{ color: '#22C55E' }}
              />
            )}
          </div>
          <div>
            <h3 className="alpha-label tracking-wide">REFLECTION GAP</h3>
          </div>
        </div>

        {hasGaps ? (
          <>
            <p className="alpha-body mb-1">
              <span
                className="font-financial font-bold text-base"
                style={{ color: '#F59E0B' }}
              >
                {unreflectedCount}
              </span>{' '}
              trade membutuhkan refleksi
            </p>
            <p className="alpha-caption">
              Alpha menemukan area yang layak kamu periksa.
            </p>
          </>
        ) : (
          <p className="alpha-body text-[#22C55E]">
            Semua trade sudah di-reflection minggu ini. Pertahankan!
          </p>
        )}
      </div>

      {hasGaps && (
        <Button
          variant="secondary"
          onClick={() => navigate('journal')}
          className="alpha-press mt-4 gap-2 w-full h-9 text-sm font-medium"
          style={{
            backgroundColor: 'rgba(245,158,11,0.12)',
            color: '#F59E0B',
            borderColor: 'rgba(245,158,11,0.25)',
          }}
        >
          <PenLine className="h-3.5 w-3.5" />
          Review Reflection
        </Button>
      )}
    </div>
  )
}