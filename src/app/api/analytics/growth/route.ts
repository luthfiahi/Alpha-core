import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/analytics/growth?period=DAILY&from=2025-07-01&to=2025-08-01
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'DAILY'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Get first trader
    let trader = await db.trader.findFirst()
    if (!trader) {
      trader = await db.trader.create({
        data: { email: 'trader@alpha.local', name: 'Luthfi' },
      })
    }

    const where: Record<string, unknown> = {
      traderId: trader.id,
      period,
    }

    if (from || to) {
      where.periodDate = {} as Record<string, unknown>
      if (from) (where.periodDate as Record<string, unknown>).gte = from
      if (to) (where.periodDate as Record<string, unknown>).lte = to
    }

    const snapshots = await db.growthSnapshot.findMany({
      where,
      orderBy: { periodDate: 'asc' },
    })

    // Calculate trends (compare last vs previous)
    const latest = snapshots[snapshots.length - 1]
    const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null

    const getTrend = (curr: number | null | undefined, prev: number | null | undefined) => {
      if (curr == null || prev == null) return 'stable' as const
      const diff = curr - prev
      if (Math.abs(diff) < 1) return 'stable' as const
      return diff > 0 ? ('up' as const) : ('down' as const)
    }

    const getDiff = (curr: number | null | undefined, prev: number | null | undefined) => {
      if (curr == null || prev == null) return null
      return Math.round((curr - prev) * 10) / 10
    }

    const currentScores = {
      emotion: latest?.emotionScore ?? null,
      consistency: latest?.consistencyScore ?? null,
      process: latest?.processScore ?? null,
      behavior: latest?.behaviorScore ?? null,
      discipline: latest?.disciplineScore ?? null,
      riskMgmt: latest?.riskMgmtScore ?? null,
    }

    const trends = {
      emotion: getTrend(latest?.emotionScore, previous?.emotionScore),
      consistency: getTrend(latest?.consistencyScore, previous?.consistencyScore),
      process: getTrend(latest?.processScore, previous?.processScore),
      behavior: getTrend(latest?.behaviorScore, previous?.behaviorScore),
      discipline: getTrend(latest?.disciplineScore, previous?.disciplineScore),
      riskMgmt: getTrend(latest?.riskMgmtScore, previous?.riskMgmtScore),
    }

    const diffs = {
      emotion: getDiff(latest?.emotionScore, previous?.emotionScore),
      consistency: getDiff(latest?.consistencyScore, previous?.consistencyScore),
      process: getDiff(latest?.processScore, previous?.processScore),
      behavior: getDiff(latest?.behaviorScore, previous?.behaviorScore),
      discipline: getDiff(latest?.disciplineScore, previous?.disciplineScore),
      riskMgmt: getDiff(latest?.riskMgmtScore, previous?.riskMgmtScore),
    }

    return NextResponse.json({
      snapshots,
      currentScores,
      trends,
      diffs,
    })
  } catch (error) {
    console.error('[GET /api/analytics/growth] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data growth' },
      { status: 500 }
    )
  }
}
