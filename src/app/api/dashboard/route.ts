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

    // 4. AI insight (latest insight card) — may not exist in early deployments
    let latestInsight = null
    try {
      latestInsight = await db.insightCard.findFirst({
        where: { traderId: trader.id },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      // insightCard table might not exist yet — degrade gracefully
    }

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

    // Today's trades count (use trader's timezone, default Asia/Makassar)
    const tz = trader.timezone || 'Asia/Makassar'
    const nowTz = new Date().toLocaleString('en-US', { timeZone: tz })
    const todayInTz = new Date(nowTz)
    todayInTz.setHours(0, 0, 0, 0)
    const todayTradesCount = await db.tradeEntry.count({
      where: {
        traderId: trader.id,
        deletedAt: null,
        createdAt: { gte: todayInTz },
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

// POST /api/dashboard — Recalculate process score from existing trades
export async function POST() {
  try {
    const trader = await db.trader.findFirst()
    if (!trader) {
      return NextResponse.json({ error: 'No trader found' }, { status: 404 })
    }

    const recentTrades = await db.tradeEntry.findMany({
      where: { traderId: trader.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    if (recentTrades.length === 0) {
      return NextResponse.json({ error: 'No trades to calculate' }, { status: 400 })
    }

    const closedTrades = recentTrades.filter((t) => t.status === 'CLOSED')
    const tradesWithSL = recentTrades.filter((t) => t.stopLoss !== null)
    const tradesWithStrategy = recentTrades.filter((t) => t.strategy !== null)
    const reflectedTrades = recentTrades.filter((t) => t.hasReflected)
    const tradesWithRR = recentTrades.filter((t) => t.stopLoss !== null && t.takeProfit !== null)
    const tradesWithEmotion = recentTrades.filter((t) => t.emotionBefore !== null || t.emotionAfter !== null)

    const discipline = Math.round((tradesWithSL.length / recentTrades.length) * 100)
    const consistency = Math.round((tradesWithStrategy.length / recentTrades.length) * 100)
    const reflection = closedTrades.length > 0
      ? Math.round((reflectedTrades.length / closedTrades.length) * 100)
      : 0
    const riskManagement = Math.round((tradesWithRR.length / recentTrades.length) * 100)
    const emotionalControl = Math.round((tradesWithEmotion.length / recentTrades.length) * 100)

    const overallScore = Math.round(
      discipline * 0.25 +
      consistency * 0.2 +
      reflection * 0.25 +
      riskManagement * 0.2 +
      emotionalControl * 0.1
    )

    const today = new Date().toISOString().split('T')[0]

    await db.processScoreSnapshot.upsert({
      where: {
        id: (await db.processScoreSnapshot.findFirst({
          where: { traderId: trader.id, period: 'DAILY', periodDate: today },
          select: { id: true },
        }))?.id || '__none__',
      },
      create: {
        traderId: trader.id,
        score: overallScore,
        components: JSON.stringify({ discipline, consistency, reflection, riskManagement, emotionalControl }),
        period: 'DAILY',
        periodDate: today,
      },
      update: {
        score: overallScore,
        components: JSON.stringify({ discipline, consistency, reflection, riskManagement, emotionalControl }),
      },
    }).catch(async () => {
      // upsert with where on non-unique field may fail — fallback to create
      await db.processScoreSnapshot.create({
        data: {
          traderId: trader.id,
          score: overallScore,
          components: JSON.stringify({ discipline, consistency, reflection, riskManagement, emotionalControl }),
          period: 'DAILY',
          periodDate: today,
        },
      })
    })

    return NextResponse.json({
      success: true,
      score: overallScore,
      components: { discipline, consistency, reflection, riskManagement, emotionalControl },
    })
  } catch (error) {
    console.error('POST /api/dashboard error:', error)
    return NextResponse.json({ error: 'Failed to recalculate' }, { status: 500 })
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
