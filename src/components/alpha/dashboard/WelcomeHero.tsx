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
}

export function WelcomeHero({ todayTradesCount, processScore }: WelcomeHeroProps) {
  const traderName = useTraderStore((s) => s.traderName)
  const name = traderName || 'Trader'
  const greeting = getGreeting()

  const summary = `Ada ${todayTradesCount} trade hari ini.${processScore !== null ? ` Process Score: ${processScore}.` : ''}`

  return (
    <div className="flex items-center justify-between h-20 px-1">
      <div>
        <h1 className="text-2xl font-semibold text-[#F3F4F6] tracking-tight">
          {greeting}, {name}
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">{summary}</p>
      </div>
    </div>
  )
}
