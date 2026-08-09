'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, PenLine } from 'lucide-react'
import { useNavigationStore } from '@/stores'

interface ReflectionGapSummaryProps {
  unreflectedCount: number
  totalWeeklyTrades?: number
  reflectedCount?: number
}

export function ReflectionGapSummary({ unreflectedCount, totalWeeklyTrades, reflectedCount }: ReflectionGapSummaryProps) {
  const hasGaps = unreflectedCount > 0
  const navigate = useNavigationStore((s) => s.navigate)

  // Use provided values when available, otherwise fall back to estimated logic
  // NOTE: When totalWeeklyTrades and reflectedCount are not provided, we estimate
  // the total from unreflectedCount. This is an approximation — prefer passing
  // real values from the API for accuracy.
  const isRealData = totalWeeklyTrades !== undefined && reflectedCount !== undefined
  const resolvedTotal = isRealData
    ? totalWeeklyTrades!
    : Math.max(unreflectedCount + Math.max(0, 5 - unreflectedCount), unreflectedCount)
  const resolvedReflected = isRealData
    ? reflectedCount!
    : Math.max(0, resolvedTotal - unreflectedCount)

  const showProgress = totalWeeklyTrades != null || unreflectedCount > 0

  return (
    <div className="alpha-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center relative"
            style={{
              backgroundColor: hasGaps
                ? 'rgba(245,158,11,0.12)'
                : 'rgba(34,197,94,0.12)',
            }}
          >
            {hasGaps ? (
              <>
                {/* Pulse ring when gaps exist */}
                <span
                  className="absolute inset-0 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(245,158,11,0.08)',
                    animation: 'alpha-subtle-pulse 2s ease-in-out infinite',
                  }}
                />
                <AlertTriangle
                  className="h-4 w-4 relative z-10"
                  style={{ color: '#F59E0B' }}
                />
              </>
            ) : (
              <CheckCircle2
                className="h-4 w-4"
                style={{ color: '#22C55E' }}
              />
            )}
          </div>
          <div>
            <h3 className="alpha-label tracking-wide" style={{ color: '#9CA3AF' }}>REFLECTION GAP</h3>
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
            {showProgress && (
              <div className="mt-2 mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="alpha-caption" style={{ color: '#6B7280' }}>
                    Progress refleksi minggu ini
                  </span>
                  <span className="text-[11px] font-financial font-medium" style={{ color: '#9CA3AF' }}>
                    {resolvedReflected} of {resolvedTotal} trades
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#232636' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: resolvedTotal > 0
                        ? `${(resolvedReflected / resolvedTotal) * 100}%`
                        : '0%',
                      backgroundColor: '#F59E0B',
                      boxShadow: '0 0 8px rgba(245,158,11,0.3)',
                    }}
                  />
                </div>
              </div>
            )}
            <p className="alpha-caption">
              Alpha menemukan area yang layak kamu periksa.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {/* Subtle checkmark animation */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'rgba(34,197,94,0.08)',
                border: '1.5px solid rgba(34,197,94,0.15)',
                animation: 'alpha-subtle-pulse 3s ease-in-out infinite',
              }}
            >
              <CheckCircle2
                className="h-5 w-5"
                style={{ color: '#22C55E' }}
              />
            </div>
            <div>
              <p className="alpha-body text-[#22C55E]">
                Semua trade sudah di-reflection minggu ini.
              </p>
              <p className="alpha-caption mt-0.5" style={{ color: '#6B7280' }}>
                Pertahankan streak konsistensimu!
              </p>
            </div>
          </div>
        )}
      </div>

      {hasGaps && (
        <Button
          variant="secondary"
          onClick={() => navigate('journal')}
          className="alpha-press mt-4 gap-2 w-full h-10 text-sm font-semibold transition-all duration-200 hover:-translate-y-[1px]"
          style={{
            backgroundColor: 'rgba(245,158,11,0.15)',
            color: '#F59E0B',
            borderColor: 'rgba(245,158,11,0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 0 16px rgba(245,158,11,0.15)',
          }}
        >
          <PenLine className="h-4 w-4" />
          Lihat Refleksi
        </Button>
      )}
    </div>
  )
}