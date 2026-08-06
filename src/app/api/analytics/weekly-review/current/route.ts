import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/analytics/weekly-review/current — get current week's review
export async function GET() {
  try {
    let trader = await db.trader.findFirst()
    if (!trader) {
      trader = await db.trader.create({
        data: { email: 'trader@alpha.local', name: 'Luthfi' },
      })
    }

    // Calculate current week range
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Sunday
    weekEnd.setHours(23, 59, 59, 999)

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    // Find review for current week
    const currentReview = await db.weeklyReviewRecord.findFirst({
      where: {
        traderId: trader.id,
        weekStart: weekStartStr,
      },
    })

    // Also get previous week review for comparison
    const prevWeekStart = new Date(weekStart)
    prevWeekStart.setDate(weekStart.getDate() - 7)
    const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0]

    const previousReview = await db.weeklyReviewRecord.findFirst({
      where: {
        traderId: trader.id,
        weekStart: prevWeekStartStr,
      },
    })

    // Get current week trades for context
    const trades = await db.tradeEntry.findMany({
      where: {
        traderId: trader.id,
        createdAt: { gte: weekStart, lte: weekEnd },
        deletedAt: null,
      },
    })

    const hasTrades = trades.length > 0

    // Parse emotion breakdown
    let emotionData: Record<string, number> = { calm: 50, anxious: 25, confident: 20, fearful: 5 }
    if (currentReview?.emotionBreakdown) {
      try {
        emotionData = JSON.parse(currentReview.emotionBreakdown)
      } catch {
        // keep default
      }
    }

    return NextResponse.json({
      current: currentReview || null,
      previous: previousReview || null,
      hasTrades,
      weekRange: { start: weekStartStr, end: weekEndStr },
      emotionBreakdown: emotionData,
    })
  } catch (error) {
    console.error('[GET /api/analytics/weekly-review/current] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil review minggu ini' },
      { status: 500 }
    )
  }
}
