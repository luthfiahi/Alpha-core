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

  const summary = `Ada ${todayTradesCount} trade hari ini.${processScore !== null ? ` Process Score: ${processScore}.` : ''}`

  return (
    <div className="alpha-animate-in-fast flex items-center justify-between h-20 px-1">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="alpha-heading-xl">
              {greeting}, {name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20">
              Project Alpha
            </span>
          </div>
          <p className="alpha-body mt-1">{summary}</p>
        </div>
      </div>
    </div>
  )
}