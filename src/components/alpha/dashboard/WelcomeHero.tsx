'use client'

import { useTraderStore } from '@/stores'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Selamat pagi'
  if (hour >= 12 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function getIndonesianDate(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  return days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear()
}

function getScoreColor(score: number | null): string {
  if (score === null) return '#6B7280'
  if (score <= 40) return '#EF4444'
  if (score <= 60) return '#F59E0B'
  if (score <= 80) return '#6366F1'
  return '#22C55E'
}

interface WelcomeHeroProps {
  todayTradesCount: number
  processScore: number | null
  traderName?: string | null
}

export function WelcomeHero({ todayTradesCount, processScore, traderName }: WelcomeHeroProps) {
  const storeName = useTraderStore((s) => s.traderName)
  const totalTrades = useTraderStore((s) => s.totalTrades) ?? 0
  const winRate = useTraderStore((s) => s.winRate) ?? 0
  const name = traderName || storeName || 'Trader'
  const greeting = getGreeting()
  const dateStr = getIndonesianDate()
  const scoreColor = getScoreColor(processScore)
  const scoreBgColor = processScore !== null ? (scoreColor + '15') : undefined
  const scoreBorderColor = processScore !== null ? ('1px solid ' + scoreColor + '25') : undefined

  return (
    <div className="alpha-animate-in-fast">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        {/* Left: Greeting + meta */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="alpha-heading-xl truncate">
              {greeting}, {name}
            </h1>
            {/* Process Score dot badge */}
            {processScore !== null && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold font-financial shrink-0"
                style={{
                  color: scoreColor,
                  backgroundColor: scoreBgColor,
                  border: scoreBorderColor,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: scoreColor }}
                />
                PS {processScore}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="alpha-caption" style={{ color: '#6B7280' }}>
              {dateStr}
            </p>
            <span className="w-1 h-1 rounded-full bg-[#4B5563] hidden sm:block" />
            <p className="alpha-body text-[#9CA3AF] hidden sm:block">
              Pantau proses trading-mu hari ini.
            </p>
          </div>
          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
              style={{
                backgroundColor: 'rgba(99,102,241,0.1)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L6.5 3.5H3.5L5 1Z" fill="#818CF8" opacity="0.7" />
                <circle cx="5" cy="7" r="1.5" fill="#818CF8" opacity="0.5" />
              </svg>
              Process Over Profit
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-financial"
              style={{
                backgroundColor: todayTradesCount > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.08)',
                color: todayTradesCount > 0 ? '#22C55E' : '#6B7280',
                border: todayTradesCount > 0 ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(107,114,128,0.1)',
              }}
            >
              {todayTradesCount === 0 ? 'Belum trading' : (todayTradesCount + ' trade hari ini')}
            </span>
          </div>
        </div>

        {/* Right: Stat cards — more prominent than before */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Context-aware sparkline — only on sm+ */}
          <svg width="72" height="28" className="hidden sm:block opacity-40" viewBox="0 0 72 28">
            <defs>
              <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={todayTradesCount > 0 ? '#22C55E' : '#6366F1'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={todayTradesCount > 0 ? '#22C55E' : '#6366F1'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={todayTradesCount > 0
                ? 'M0 24 L9 20 L18 22 L27 16 L36 18 L45 14 L54 10 L63 12 L72 14 L72 28 L0 28 Z'
                : 'M0 22 L9 20 L18 21 L27 18 L36 19 L45 16 L54 17 L63 14 L72 12 L72 28 L0 28 Z'
              }
              fill="url(#hero-spark)"
            />
            <polyline
              points={todayTradesCount > 0
                ? '0,24 9,20 18,22 27,16 36,18 45,14 54,10 63,12 72,14'
                : '0,22 9,20 18,21 27,18 36,19 45,16 54,17 63,14 72,12'
              }
              fill="none"
              stroke={todayTradesCount > 0 ? '#22C55E' : '#6366F1'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Stat chip: Total Trades */}
          <div className="alpha-stat-card flex flex-col items-center px-4 py-2 min-w-0">
            <span className="alpha-caption" style={{ color: '#6B7280' }}>Total Trades</span>
            <span className="font-financial text-lg font-bold text-[#F3F4F6] leading-tight">{totalTrades}</span>
          </div>

          {/* Divider */}
          <span className="w-px h-10 bg-[#232636] hidden sm:block" />

          {/* Stat chip: Win Rate */}
          <div className="alpha-stat-card flex flex-col items-center px-4 py-2 min-w-0">
            <span className="alpha-caption" style={{ color: '#6B7280' }}>Win Rate</span>
            <span className="font-financial text-lg font-bold leading-tight" style={{ color: winRate >= 50 ? '#22C55E' : '#F59E0B' }}>
              {winRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
