import { NextResponse } from 'next/server'
import { buildTraderContext } from '@/lib/ai/memory/context-builder'
import { formatMemoryContextForPrompt } from '@/lib/ai/memory/types'
import { requireTrader } from '@/lib/api-auth'

// GET /api/memory/context — Returns full TraderMemoryContext
export async function GET(request: Request) {
  try {
    const { trader, error: authError } = await requireTrader()
    if (authError) return authError
    if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') // 'full' (default) or 'prompt'

    const context = await buildTraderContext(trader.id)

    if (format === 'prompt') {
      // Return formatted prompt-ready string
      return NextResponse.json({
        context: formatMemoryContextForPrompt(context),
        traderId: context.traderId,
      })
    }

    // Return the full context object (stripped of raw arrays for the response)
    return NextResponse.json({
      traderName: context.traderName,
      traderId: context.traderId,
      totalTrades: context.totalTrades,
      totalWinRate: context.totalWinRate,
      recentWinRate: context.recentWinRate,
      recentPnL: context.recentPnL,
      avgProcessScore: context.avgProcessScore,
      recentTradeCount: context.recentTrades.length,
      topBehaviors: context.topBehaviors,
      behaviorTrend: context.behaviorTrend,
      unreflectedTradeCount: context.unreflectedTradeCount,
      playbookUsage: context.playbookUsage,
      playbookComplianceAvg: context.playbookComplianceAvg,
      mostUsedPlaybook: context.mostUsedPlaybook,
      processScoreTrend: context.processScoreTrend,
      l1Summary: context.l1Summary,
      l2Digest: context.l2Digest
        ? {
            tradingStyle: context.l2Digest.tradingStyle,
            dominantEmotions: context.l2Digest.dominantEmotions,
            strengths: context.l2Digest.strengths,
            weaknesses: context.l2Digest.weaknesses,
            bestSetup: context.l2Digest.bestSetup,
            bestSession: context.l2Digest.bestSession,
            bestRiskReward: context.l2Digest.bestRiskReward,
            readinessTrend: context.l2Digest.readinessTrend,
            psychologicalNotes: context.l2Digest.psychologicalNotes,
            totalTradesAnalyzed: context.l2Digest.totalTradesAnalyzed,
            analysisPeriod: context.l2Digest.analysisPeriod,
          }
        : null,
      emotionBreakdown: context.emotionBreakdown,
      dominantEmotion: context.dominantEmotion,
    })
  } catch (error) {
    console.error('GET /api/memory/context error:', error)
    return NextResponse.json(
      { error: 'Failed to build trader context' },
      { status: 500 }
    )
  }
}
