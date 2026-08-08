'use client'

import { useTraderStore } from '@/stores'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Selamat pagi'
  if (hour >= 12 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

interface WelcomeHeroProps {
  todayTradesCount: number
  processScore: number | null
  traderName?: string | null
}

export function WelcomeHero({ todayTradesCount, processScore, traderName }: WelcomeHeroProps) {
  const storeName = useTraderStore((s) => s.traderName)
  const name = traderName || storeName || 'Trader'
  const greeting = getGreeting()

  return (
    <div className="alpha-animate-in-fast flex items-center justify-between h-20 px-1">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="alpha-heading-xl">
            {greeting}, {name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="alpha-body">Pantau proses trading-mu hari ini.</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#22C55E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Alpha is ready
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}