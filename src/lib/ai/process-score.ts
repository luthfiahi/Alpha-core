import { db } from '@/lib/db'

/**
 * Computes a daily process score (0-100) from the trader's recent trades.
 * Creates/updates a ProcessScoreSnapshot for today.
 * Called after trade creation/update (non-blocking).
 */
export async function computeAndSaveProcessScore(traderId: string) {
  try {
    const now = new Date()

    const recentTrades = await db.tradeEntry.findMany({
      where: { traderId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    if (recentTrades.length === 0) return

    // Calculate sub-scores
    const closedTrades = recentTrades.filter((t) => t.status === 'CLOSED')

    // 1. Discipline: % of trades with stopLoss set
    const tradesWithSL = recentTrades.filter((t) => t.stopLoss !== null)
    const discipline =
      recentTrades.length > 0
        ? Math.round((tradesWithSL.length / recentTrades.length) * 100)
        : 0

    // 2. Consistency: based on strategy usage and playbook compliance
    const tradesWithStrategy = recentTrades.filter((t) => t.strategy !== null)
    const consistency =
      recentTrades.length > 0
        ? Math.round((tradesWithStrategy.length / recentTrades.length) * 100)
        : 0

    // 3. Reflection: % of closed trades that have been reflected
    const reflectedTrades = recentTrades.filter((t) => t.hasReflected)
    const reflection =
      closedTrades.length > 0
        ? Math.round((reflectedTrades.length / closedTrades.length) * 100)
        : 0

    // 4. Risk Management: ratio of trades with proper R:R (SL + TP both set)
    const tradesWithRR = recentTrades.filter(
      (t) => t.stopLoss !== null && t.takeProfit !== null
    )
    const riskManagement =
      recentTrades.length > 0
        ? Math.round((tradesWithRR.length / recentTrades.length) * 100)
        : 0

    // 5. Emotional Control: % of trades with emotion tracked
    const tradesWithEmotion = recentTrades.filter(
      (t) => t.emotionBefore !== null || t.emotionAfter !== null
    )
    const emotionalControl =
      recentTrades.length > 0
        ? Math.round((tradesWithEmotion.length / recentTrades.length) * 100)
        : 0

    // Weighted average for overall score
    const overallScore = Math.round(
      discipline * 0.25 +
        consistency * 0.2 +
        reflection * 0.25 +
        riskManagement * 0.2 +
        emotionalControl * 0.1
    )

    const today = now.toISOString().split('T')[0]

    // Upsert today's snapshot
    const existing = await db.processScoreSnapshot.findFirst({
      where: {
        traderId,
        period: 'DAILY',
        periodDate: today,
      },
    })

    if (existing) {
      await db.processScoreSnapshot.update({
        where: { id: existing.id },
        data: {
          score: overallScore,
          components: JSON.stringify({
            discipline,
            consistency,
            reflection,
            riskManagement,
            emotionalControl,
          }),
        },
      })
    } else {
      await db.processScoreSnapshot.create({
        data: {
          traderId,
          score: overallScore,
          components: JSON.stringify({
            discipline,
            consistency,
            reflection,
            riskManagement,
            emotionalControl,
          }),
          period: 'DAILY',
          periodDate: today,
        },
      })
    }
  } catch (err) {
    console.error('Process score calculation failed (non-blocking):', err)
  }
}
