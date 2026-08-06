// ========================================
// AI Memory System — Context Builder
// Task 17: Compiles comprehensive trader context
// ========================================

import { db } from '@/lib/db'
import type { TraderMemoryContext } from './types'
import { computeTrend } from './types'

/**
 * Builds a comprehensive TraderMemoryContext for AI coaching prompts.
 * Queries all relevant data from the database and aggregates it.
 */
export async function buildTraderContext(traderId?: string): Promise<TraderMemoryContext> {
  // Resolve trader (MVP: use first trader if no ID provided)
  let trader
  if (traderId) {
    trader = await db.trader.findUnique({ where: { id: traderId } })
  }
  if (!trader) {
    trader = await db.trader.findFirst()
  }
  if (!trader) {
    // Return empty context if no trader exists
    return emptyContext()
  }

  const tid = trader.id

  // ---- Date boundaries ----
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // ---- Parallel queries ----
  const [
    allTrades,
    recentTrades,
    recentBehavioralEvents,
    unreflectedCount,
    recentReflectedTrades,
    playbookStats,
    processScores,
    l1Summary,
    l2Digest,
    growthSnapshots,
  ] = await Promise.all([
    // All trades (for total stats)
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    // Recent trades (30 days)
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
    }),
    // Behavioral events (90 days)
    db.behavioralEvent.findMany({
      where: { traderId: tid, createdAt: { gte: ninetyDaysAgo } },
      orderBy: { createdAt: 'desc' },
    }),
    // Unreflected trade count
    db.tradeEntry.count({
      where: { traderId: tid, deletedAt: null, hasReflected: false },
    }),
    // Recent reflections (last 5 reflected trades)
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null, hasReflected: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { reflectionNotes: true },
    }),
    // Playbook stats: trades with playbook + compliance
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null, playbookId: { not: null } },
      include: { playbook: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    // Process score snapshots (last 30)
    db.processScoreSnapshot.findMany({
      where: { traderId: tid },
      orderBy: { createdAt: 'asc' },
      take: 30,
    }),
    // L1 summary
    db.memoryL1Summary.findUnique({ where: { traderId: tid } }),
    // L2 digest
    db.memoryL2Digest.findUnique({ where: { traderId: tid } }),
    // Growth snapshots (last 90 days)
    db.growthSnapshot.findMany({
      where: { traderId: tid, createdAt: { gte: ninetyDaysAgo } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // ---- Aggregate: Total stats ----
  const totalTrades = allTrades.length
  const totalWins = allTrades.filter((t) => t.profitLoss > 0).length
  const totalWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0

  // ---- Aggregate: Recent 30d ----
  const recentWins = recentTrades.filter((t) => t.profitLoss > 0).length
  const recentWinRate = recentTrades.length > 0 ? (recentWins / recentTrades.length) * 100 : 0
  const recentPnL = recentTrades.reduce((sum, t) => sum + t.profitLoss, 0)
  const avgProcessScore =
    recentTrades.length > 0
      ? recentTrades.reduce((sum, t) => sum + (t.processScore || 0), 0) / recentTrades.length
      : 0

  // ---- Aggregate: Behavioral events ----
  const behaviorCounts = new Map<string, number>()
  for (const event of recentBehavioralEvents) {
    behaviorCounts.set(
      event.behaviorType,
      (behaviorCounts.get(event.behaviorType) || 0) + 1
    )
  }
  const topBehaviors = Array.from(behaviorCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Behavior trend: compare last 30d vs previous 30d
  const thirtyToSixty = new Date(now)
  thirtyToSixty.setDate(thirtyToSixty.getDate() - 60)
  const recentBehaviorCount = recentBehavioralEvents.filter(
    (e) => e.createdAt >= thirtyDaysAgo
  ).length
  // We need the older count too — fetch if we have events
  let olderBehaviorCount = 0
  if (recentBehavioralEvents.length > 0) {
    const olderEvents = await db.behavioralEvent.count({
      where: {
        traderId: tid,
        createdAt: { gte: ninetyDaysAgo, lt: thirtyDaysAgo },
      },
    })
    olderBehaviorCount = olderEvents
  }
  const behaviorTrend = computeBehaviorTrend(recentBehaviorCount, olderBehaviorCount)

  // ---- Aggregate: Reflections ----
  const recentReflections = recentReflectedTrades
    .map((t) => t.reflectionNotes || '')
    .filter(Boolean)

  // ---- Aggregate: Playbook ----
  const totalTradesWithPlaybook = allTrades.filter((t) => t.playbookId !== null).length
  const playbookUsage = totalTrades > 0 ? (totalTradesWithPlaybook / totalTrades) * 100 : 0

  // Playbook compliance average
  const complianceScores = playbookStats
    .map((t) => t.playbookCompliance)
    .filter((c): c is number => c !== null && c !== undefined)
  const playbookComplianceAvg =
    complianceScores.length > 0
      ? complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length
      : 0

  // Most used playbook
  const playbookNameCounts = new Map<string, number>()
  for (const t of playbookStats) {
    const name = t.playbook?.name || 'Unknown'
    playbookNameCounts.set(name, (playbookNameCounts.get(name) || 0) + 1)
  }
  const mostUsedPlaybook =
    Array.from(playbookNameCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'

  // ---- Aggregate: Process Score History ----
  const processScoreHistory = processScores.map((s) => ({
    date: s.periodDate || s.createdAt.toISOString().split('T')[0],
    score: s.score,
  }))
  const processScoreTrend = computeTrend(processScores.map((s) => s.score))

  // ---- Aggregate: Emotions ----
  const emotionBreakdown: Record<string, number> = {}
  const emotionMap = new Map<string, number>()
  for (const trade of recentTrades) {
    if (trade.emotionBefore) {
      emotionMap.set(trade.emotionBefore, (emotionMap.get(trade.emotionBefore) || 0) + 1)
    }
    if (trade.emotionAfter) {
      emotionMap.set(trade.emotionAfter, (emotionMap.get(trade.emotionAfter) || 0) + 1)
    }
  }
  const totalEmotionEntries = Array.from(emotionMap.values()).reduce((a, b) => a + b, 0)
  if (totalEmotionEntries > 0) {
    for (const [emotion, count] of emotionMap) {
      emotionBreakdown[emotion] = Math.round((count / totalEmotionEntries) * 100)
    }
  }
  const dominantEmotion =
    Array.from(emotionMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'

  return {
    traderName: trader.name || 'Trader',
    traderId: tid,
    totalTrades,
    totalWinRate,
    recentTrades,
    recentWinRate,
    recentPnL,
    avgProcessScore,
    behavioralEvents: recentBehavioralEvents,
    topBehaviors,
    behaviorTrend,
    unreflectedTradeCount: unreflectedCount,
    recentReflections,
    playbookUsage,
    playbookComplianceAvg,
    mostUsedPlaybook,
    processScoreHistory,
    processScoreTrend,
    l1Summary: l1Summary?.summary || null,
    l2Digest,
    emotionBreakdown,
    dominantEmotion,
    growthSnapshots,
  }
}

// ---- Helpers ----

function computeBehaviorTrend(
  recentCount: number,
  olderCount: number
): 'improving' | 'stable' | 'declining' {
  if (olderCount === 0 && recentCount === 0) return 'stable'
  if (olderCount === 0) return recentCount <= 2 ? 'stable' : 'declining'
  const ratio = recentCount / olderCount
  if (ratio < 0.7) return 'improving' // fewer behavioral events = better
  if (ratio > 1.3) return 'declining'
  return 'stable'
}

function emptyContext(): TraderMemoryContext {
  return {
    traderName: 'Trader',
    traderId: '',
    totalTrades: 0,
    totalWinRate: 0,
    recentTrades: [],
    recentWinRate: 0,
    recentPnL: 0,
    avgProcessScore: 0,
    behavioralEvents: [],
    topBehaviors: [],
    behaviorTrend: 'stable',
    unreflectedTradeCount: 0,
    recentReflections: [],
    playbookUsage: 0,
    playbookComplianceAvg: 0,
    mostUsedPlaybook: 'none',
    processScoreHistory: [],
    processScoreTrend: 'stable',
    l1Summary: null,
    l2Digest: null,
    emotionBreakdown: {},
    dominantEmotion: 'unknown',
    growthSnapshots: [],
  }
}
