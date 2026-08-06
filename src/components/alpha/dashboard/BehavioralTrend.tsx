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
  const width = 56
  const height = 24
  const padding = 2

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
      />
    </svg>
  )
}

export function BehavioralTrend({ tags }: BehavioralTrendProps) {
  const displayTags = tags.length > 0 ? tags : defaultTags

  return (
    <div className="alpha-card p-5 h-full">
      <h3 className="text-sm font-semibold text-[#F3F4F6] mb-4">
        Behavioral Trend
      </h3>
      <div className="space-y-3">
        {displayTags.map((tag) => {
          const isUp = tag.trend > 0
          const color =
            tag.severity === 'HIGH' ? '#EF4444' : '#F59E0B'
          const isBadTrend =
            (isUp && tag.severity !== 'LOW') || (!isUp && tag.severity === 'LOW')
          // For negative patterns, up = bad, down = good
          const trendColor = isBadTrend ? '#EF4444' : '#22C55E'

          return (
            <div
              key={tag.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-[#F3F4F6]">{tag.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <MiniSparkline data={tag.sparkline} color={color} />
                <div
                  className={`flex items-center gap-0.5 text-xs font-financial font-medium ${isUp ? '' : ''}`}
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
