'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface BehavioralTag {
  name: string
  trend: number // percentage, positive = increasing (bad for negative patterns)
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  sparkline: number[] // mini data points
}

interface BehavioralTrendProps {
  tags: BehavioralTag[]
}

const defaultTags: BehavioralTag[] = [
  {
    name: 'Revenge Trading',
    trend: -12,
    severity: 'HIGH',
    sparkline: [3, 5, 4, 2, 1, 2, 1],
  },
  {
    name: 'Overtrading',
    trend: 8,
    severity: 'MEDIUM',
    sparkline: [2, 3, 2, 4, 3, 5, 4],
  },
  {
    name: 'Plan Deviation',
    trend: -5,
    severity: 'MEDIUM',
    sparkline: [4, 3, 3, 2, 2, 1, 1],
  },
]

function getSeverityColor(severity: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (severity) {
    case 'HIGH': return '#EF4444'
    case 'MEDIUM': return '#F59E0B'
    case 'LOW': return '#22C55E'
  }
}

function getSeverityGlow(severity: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (severity) {
    case 'HIGH': return '0 0 6px rgba(239,68,68,0.4)'
    case 'MEDIUM': return '0 0 6px rgba(245,158,11,0.4)'
    case 'LOW': return '0 0 6px rgba(34,197,94,0.4)'
  }
}

function MiniSparkline({
  data,
  color,
}: {
  data: number[]
  color: string
}) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 72
  const height = 32
  const padding = 3

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y =
        padding + (1 - (val - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* End dot */}
      <circle
        cx={padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)}
        cy={padding + (1 - (data[data.length - 1] - min) / range) * (height - padding * 2)}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}

export function BehavioralTrend({ tags }: BehavioralTrendProps) {
  const isUsingDefaults = tags.length === 0
  const displayTags = isUsingDefaults ? defaultTags : tags

  return (
    <div className="alpha-card p-4 sm:p-5 h-full flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="alpha-heading-sm">Behavioral Trend</h3>
          <p className="alpha-caption mt-0.5">Pola perilaku mingguan</p>
        </div>
        {isUsingDefaults && (
          <span
            className="text-[9px] font-medium px-2 py-0.5 rounded-full"
            style={{
              color: '#6B7280',
              backgroundColor: 'rgba(107,114,128,0.08)',
              border: '1px solid rgba(107,114,128,0.1)',
            }}
          >
            Based on sample data
          </span>
        )}
      </div>
      <div className="space-y-1.5 flex-1">
        {displayTags.map((tag) => {
          const isUp = tag.trend > 0
          const severityColor = getSeverityColor(tag.severity)
          const severityGlow = getSeverityGlow(tag.severity)
          const isBadTrend =
            (isUp && tag.severity !== 'LOW') || (!isUp && tag.severity === 'LOW')
          // For negative patterns, up = bad, down = good
          const trendColor = isBadTrend ? '#EF4444' : '#22C55E'

          return (
            <div
              key={tag.name}
              className="flex items-center justify-between py-2 px-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.04] group cursor-pointer"
              style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}
            >
              <div className="flex items-center gap-2">
                {/* Severity dot with glow */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: severityColor,
                    boxShadow: severityGlow,
                  }}
                />
                <span className="text-xs font-medium text-[#F3F4F6] truncate">{tag.name}</span>
                {/* Severity badge */}
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    color: severityColor,
                    backgroundColor: `${severityColor}15`,
                  }}
                >
                  {tag.severity}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MiniSparkline data={tag.sparkline} color={severityColor} />
                <div
                  className="flex items-center gap-0.5 text-[11px] font-financial font-semibold min-w-[48px] justify-end"
                  style={{ color: trendColor }}
                >
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  <span>{Math.abs(tag.trend)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}