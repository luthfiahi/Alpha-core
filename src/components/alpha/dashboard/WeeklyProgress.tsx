'use client'

import { TrendingUp } from 'lucide-react'
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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#151827] border border-[#232636] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-[#6B7280] mb-0.5">{label}</p>
      <p className="text-sm font-financial font-semibold text-[#F3F4F6]">
        {payload[0].value}
      </p>
    </div>
  )
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  if (data.length === 0) {
    return (
      <div className="alpha-card p-5 flex flex-col">
        <h3 className="alpha-heading-sm mb-4">
          Weekly Progress
        </h3>
        <div className="flex-1 min-h-[180px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <TrendingUp className="h-8 w-8 text-[#4B5563]" />
            <p className="text-sm font-medium text-[#9CA3AF]">
              Belum ada data mingguan
            </p>
            <p className="alpha-caption text-center max-w-[200px]">
              Process Score akan muncul setelah kamu mencatat trade
            </p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
  }))

  return (
    <div className="alpha-card p-5 flex flex-col">
      <h3 className="alpha-heading-sm mb-4">
        Weekly Progress
      </h3>
      <div className="flex-1 min-h-[180px] alpha-animate-scale">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              dy={8}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              ticks={[0, 50, 100]}
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
