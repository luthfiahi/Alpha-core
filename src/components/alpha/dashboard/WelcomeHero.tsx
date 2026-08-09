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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="alpha-heading-xl">
              {greeting}, {name}
            </h1>
            {/* Process Score dot badge */}
            {processScore !== null && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold font-financial"
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
          <div className="flex items-center gap-3 mt-0.5">
            <p className="alpha-caption" style={{ color: '#6B7280' }}>
              {dateStr}
            </p>
            <span className="w-1 h-1 rounded-full bg-[#4B5563]" />
            <p className="alpha-body text-[#9CA3AF]">
              Pantau proses trading-mu hari ini.
            </p>
          </div>
          {/* Process Over Profit tagline badge + Today's trades chip */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
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
            {/* Today's trade count stat chip */}
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

        {/* Right-side stats summary */}
        <div className="flex items-center gap-4">
          {/* Context-aware sparkline */}
          <svg width="80" height="32" className="hidden sm:block opacity-50" viewBox="0 0 80 32">
            <defs>
              <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={todayTradesCount > 0 ? '#22C55E' : '#6366F1'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={todayTradesCount > 0 ? '#22C55E' : '#6366F1'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={todayTradesCount > 0
                ? 'M0 28 L12 22 L24 24 L36 18 L48 20 L60 14 L72 10 L80 12 L80 32 L0 32 Z'
                : 'M0 26 L10 24 L20 25 L30 22 L40 23 L50 20 L60 21 L70 18 L80 16 L80 32 L0 32 Z'
              }
              fill="url(#hero-spark)"
            />
            <polyline
              points={todayTradesCount > 0
                ? '0,28 12,22 24,24 36,18 48,20 60,14 72,10 80,12'
                : '0,26 10,24 20,25 30,22 40,23 50,20 60,21 70,18 80,16'
              }
              fill="none"
              stroke={todayTradesCount > 0 ? '#22C55E' : '#6366F1'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Stats chips */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="alpha-caption" style={{ color: '#6B7280' }}>Total Trades</span>
              <span className="font-financial text-base font-bold text-[#F3F4F6]">{totalTrades}</span>
            </div>
            <span className="w-px h-8 bg-[#232636]" />
            <div className="flex flex-col items-end">
              <span className="alpha-caption" style={{ color: '#6B7280' }}>Win Rate</span>
              <span className="font-financial text-base font-bold" style={{ color: winRate >= 50 ? '#22C55E' : '#F59E0B' }}>
                {winRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
