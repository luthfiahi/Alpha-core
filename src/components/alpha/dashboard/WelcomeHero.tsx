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
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}

interface WelcomeHeroProps {
  todayTradesCount: number
  processScore: number | null
  traderName?: string | null
}

export function WelcomeHero({ todayTradesCount, processScore, traderName }: WelcomeHeroProps) {
  const storeName = useTraderStore((s) => s.traderName)
  const totalTrades = useTraderStore((s) => s.totalTrades)
  const winRate = useTraderStore((s) => s.winRate)
  const name = traderName || storeName || 'Trader'
  const greeting = getGreeting()
  const dateStr = getIndonesianDate()

  return (
    <div className="alpha-animate-in-fast">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="alpha-heading-xl">
              {greeting}, {name}
            </h1>
            {/* Pulsing dot indicator */}
            <span className="inline-flex items-center gap-2 text-xs text-[#22C55E]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              <span className="text-[#9CA3AF] font-medium">System Online</span>
            </span>
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
          {/* Process Over Profit tagline badge */}
          <div className="mt-2">
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
          </div>
        </div>

        {/* Right-side stats summary */}
        <div className="flex items-center gap-4">
          {/* Micro sparkline decoration */}
          <svg width="80" height="32" className="hidden sm:block opacity-40" viewBox="0 0 80 32">
            <defs>
              <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 24 L10 20 L20 22 L30 16 L40 18 L50 12 L60 14 L70 8 L80 10 L80 32 L0 32 Z"
              fill="url(#hero-spark)"
            />
            <polyline
              points="0,24 10,20 20,22 30,16 40,18 50,12 60,14 70,8 80,10"
              fill="none"
              stroke="#6366F1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Stats chips */}
          <div className="flex items-center gap-3">
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