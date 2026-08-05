import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard - Aggregated dashboard data
export async function GET() {
  try {
    // Get first trader
    let trader = await db.trader.findFirst()
    if (!trader) {
      trader = await db.trader.create({
        data: {
          email: 'trader@alpha.local',
          name: 'Luthfi',
        },
      })
    }

    // 1. Process score (latest snapshot)
    const latestSnapshot = await db.processScoreSnapshot.findFirst({
      where: { traderId: trader.id },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Recent 5 trades
    const recentTrades = await db.tradeEntry.findMany({
      where: { traderId: trader.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // 3. Unreflected trades count (this week)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)

    const unreflectedCount = await db.tradeEntry.count({
      where: {
        traderId: trader.id,
        hasReflected: false,
        createdAt: { gte: weekStart },
        deletedAt: null,
      },
    })

    // 4. AI insight (latest insight card)
    const latestInsight = await db.insightCard.findFirst({
      where: { traderId: trader.id },
      orderBy: { createdAt: 'desc' },
    })

    // 5. Weekly process score trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const weeklyTrend = await db.processScoreSnapshot.findMany({
      where: {
        traderId: trader.id,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Build daily map
    const dailyMap: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(sevenDaysAgo.getDate() + i)
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = null as unknown as number
    }

    for (const snap of weeklyTrend) {
      const key = snap.createdAt.toISOString().split('T')[0]
      if (key in dailyMap) {
        dailyMap[key] = snap.score
      }
    }

    const weeklyTrendData = Object.entries(dailyMap).map(([date, score]) => ({
      date,
      score: score ?? 0,
    }))

    // 6. Total trades count & win rate
    const totalTrades = await db.tradeEntry.count({
      where: { traderId: trader.id, deletedAt: null, status: 'CLOSED' },
    })

    const winningTrades = await db.tradeEntry.count({
      where: {
        traderId: trader.id,
        deletedAt: null,
        status: 'CLOSED',
        profitLoss: { gt: 0 },
      },
    })

    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

    // Today's trades count
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayTradesCount = await db.tradeEntry.count({
      where: {
        traderId: trader.id,
        deletedAt: null,
        createdAt: { gte: todayStart },
      },
    })

    return NextResponse.json({
      trader: {
        id: trader.id,
        name: trader.name,
        email: trader.email,
      },
      processScore: latestSnapshot?.score ?? null,
      processScorePrevious: latestSnapshot
        ? (await getPreviousScore(trader.id, latestSnapshot.createdAt))
        : null,
      recentTrades,
      unreflectedCount,
      latestInsight,
      weeklyTrend: weeklyTrendData,
      totalClosedTrades: totalTrades,
      winRate,
      todayTradesCount,
    })
  } catch (error) {
    console.error('[GET /api/dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

async function getPreviousScore(traderId: string, currentCreatedAt: Date) {
  const prev = await db.processScoreSnapshot.findFirst({
    where: {
      traderId,
      createdAt: { lt: currentCreatedAt },
    },
    orderBy: { createdAt: 'desc' },
  })
  return prev?.score ?? null
}
