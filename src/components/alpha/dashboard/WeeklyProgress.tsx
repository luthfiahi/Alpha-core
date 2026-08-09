'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WeeklyProgressProps {
  data: { date: string; score: number }[]
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { weekday: 'short' })
  } catch {
    return dateStr
  }
}

function getFullDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

function getScoreColor(score: number): string {
  if (score > 80) return '#22C55E'
  if (score > 60) return '#6366F1'
  if (score > 40) return '#F59E0B'
  return '#EF4444'
}

function PremiumTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload?: { fullLabel?: string } }> }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  const fullLabel = payload[0].payload?.fullLabel
  const color = getScoreColor(value)
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        backgroundColor: '#1a1d2e',
        border: '1px solid #2a2d40',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p className="text-[10px] font-medium mb-1.5" style={{ color: '#6B7280' }}>{fullLabel}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-financial text-xl font-bold" style={{ color: '#F3F4F6' }}>
          {value}
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}18` }}>
          {value > 80 ? 'Excellent' : value > 60 ? 'Good' : value > 40 ? 'Fair' : 'Needs Work'}
        </span>
      </div>
    </div>
  )
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  if (data.length === 0) {
    return (
      <div className="alpha-card p-5 flex flex-col h-full">
        <div>
          <h3 className="alpha-heading-sm">Weekly Progress</h3>
          <p className="alpha-caption mt-0.5">Proses mingguan</p>
        </div>
        <div className="flex-1 min-h-[180px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            {/* Subtle SVG illustration */}
            <svg width="80" height="56" viewBox="0 0 80 56" fill="none" className="opacity-25">
              <path d="M8 44 L20 36 L32 40 L44 28 L56 32 L68 20 L80 16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 44 L20 36 L32 40 L44 28 L56 32 L68 20 L80 16 L80 56 L8 56 Z" fill="url(#weekly-empty-grad)" />
              <circle cx="68" cy="20" r="4" fill="#6366F1" opacity="0.4" />
              <circle cx="68" cy="20" r="7" stroke="#6366F1" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
              <defs>
                <linearGradient id="weekly-empty-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <p className="text-sm font-medium text-[#9CA3AF]">
              Belum cukup data untuk membaca perkembangan minggu ini.
            </p>
            <p className="alpha-caption text-center max-w-[220px]">
              Log beberapa trade untuk mulai melihat pola.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
    fullLabel: getFullDayLabel(d.date),
  }))

  // Get the latest (current) score
  const currentScore = chartData[chartData.length - 1]?.score ?? 0
  const currentColor = getScoreColor(currentScore)

  return (
    <div className="alpha-card p-5 flex flex-col h-full relative">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="alpha-heading-sm">Weekly Progress</h3>
          <p className="alpha-caption mt-0.5">Proses mingguan</p>
        </div>
        {/* Large current score overlay */}
        <div className="flex flex-col items-end">
          <span className="font-financial text-3xl font-bold leading-none" style={{ color: currentColor }}>
            {currentScore}
          </span>
          <span className="alpha-caption mt-0.5" style={{ color: '#6B7280' }}>Today</span>
        </div>
      </div>
      <div className="flex-1 min-h-[180px] mt-4 alpha-animate-scale relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
              dy={8}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              ticks={[0, 50, 100]}
              dx={-4}
            />
            <Tooltip
              content={<PremiumTooltip />}
              cursor={{
                stroke: currentColor + '4D',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={currentColor}
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: currentColor,
                stroke: '#151827',
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
