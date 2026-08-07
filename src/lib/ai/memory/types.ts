// ========================================
// AI Memory System — Type Definitions
// Task 17: AI Memory System
// ========================================

import type { TradeEntry, BehavioralEvent, GrowthSnapshot, MemoryL2Digest as PrismaMemoryL2Digest } from '@prisma/client'

export interface TraderMemoryContext {
  // Basic info
  traderName: string
  traderId: string
  totalTrades: number
  totalWinRate: number

  // Recent performance (last 30 days)
  recentTrades: TradeEntry[]
  recentWinRate: number
  recentPnL: number
  avgProcessScore: number

  // Behavioral patterns (last 90 days)
  behavioralEvents: BehavioralEvent[]
  topBehaviors: Array<{ type: string; count: number }>
  behaviorTrend: 'improving' | 'stable' | 'declining'

  // Reflections
  unreflectedTradeCount: number
  recentReflections: string[]

  // Playbook
  playbookUsage: number // percentage of trades with playbook
  playbookComplianceAvg: number
  mostUsedPlaybook: string

  // Process Score history
  processScoreHistory: Array<{ date: string; score: number }>
  processScoreTrend: 'improving' | 'stable' | 'declining'

  // L1/L2 Memory
  l1Summary: string | null
  l2Digest: PrismaMemoryL2Digest | null

  // Emotions
  emotionBreakdown: Record<string, number>
  dominantEmotion: string

  // Growth
  growthSnapshots: GrowthSnapshot[]
}

/** Helper: compute trend from an ordered array of scores */
export function computeTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable'
  const half = Math.floor(scores.length / 2)
  const recent = scores.slice(-half)
  const older = scores.slice(0, half)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  const diff = recentAvg - olderAvg
  if (diff > 3) return 'improving'
  if (diff < -3) return 'declining'
  return 'stable'
}

/** Helper: format a TraderMemoryContext into the prompt block */
export function formatMemoryContextForPrompt(ctx: TraderMemoryContext): string {
  const lines: string[] = []
  lines.push('[ALPHA MEMORY — Trader Deep Context (Last 90 Days):]')

  // Line 1: Total stats
  lines.push(`- Total trades: ${ctx.totalTrades}, Win rate: ${Number(ctx.totalWinRate || 0).toFixed(1)}%`)

  // Line 2: Recent 30d
  lines.push(
    `- Recent (30d): ${ctx.recentTrades.length} trades, Win rate: ${Number(ctx.recentWinRate || 0).toFixed(1)}%, P/L: $${(ctx.recentPnL || 0) >= 0 ? '+' : ''}${Number(ctx.recentPnL || 0).toFixed(2)}`
  )

  // Line 3: Process score trend
  const psTrendLabel =
    ctx.processScoreTrend === 'improving'
      ? 'improving'
      : ctx.processScoreTrend === 'declining'
        ? 'declining'
        : 'stable'
  const psLatest = ctx.processScoreHistory.length > 0
    ? ctx.processScoreHistory[ctx.processScoreHistory.length - 1].score
    : 0
  const psFirst = ctx.processScoreHistory.length > 0
    ? ctx.processScoreHistory[0].score
    : 0
  lines.push(`- Process Score trend: ${psTrendLabel} (${psFirst} → ${psLatest}), avg: ${Number(ctx.avgProcessScore || 0).toFixed(0)}`)

  // Line 4: Behavioral events
  const behaviorDesc = ctx.topBehaviors
    .slice(0, 4)
    .map((b) => `${b.count} ${b.type}`)
    .join(', ')
  lines.push(`- Behavioral events (90d): ${behaviorDesc || 'none'} (${ctx.behaviorTrend})`)

  // Line 5: Unreflected
  lines.push(`- Unreflected trades: ${ctx.unreflectedTradeCount}`)

  // Line 6: Playbook
  lines.push(
    `- Playbook usage: ${Number(ctx.playbookUsage || 0).toFixed(0)}%, most used: ${ctx.mostUsedPlaybook || 'none'}${Number(ctx.playbookComplianceAvg || 0) > 0 ? ` (avg compliance ${(Number(ctx.playbookComplianceAvg || 0) * 100).toFixed(0)}%)` : ''}`
  )

  // Line 7: Dominant emotion
  lines.push(`- Dominant emotion: ${ctx.dominantEmotion || 'unknown'}${ctx.emotionBreakdown && Object.keys(ctx.emotionBreakdown).length > 0 ? ` (${Object.entries(ctx.emotionBreakdown).map(([k, v]) => `${k} ${v}%`).join(', ')})` : ''}`)

  // Line 8: Strengths & Weaknesses (from L2)
  if (ctx.l2Digest) {
    const strengths = ctx.l2Digest.strengths ? JSON.parse(ctx.l2Digest.strengths) as string[] : []
    const weaknesses = ctx.l2Digest.weaknesses ? JSON.parse(ctx.l2Digest.weaknesses) as string[] : []
    if (strengths.length > 0) {
      lines.push(`- Strengths: ${strengths.join(', ')}`)
    }
    if (weaknesses.length > 0) {
      lines.push(`- Weaknesses: ${weaknesses.join(', ')}`)
    }
  }

  // Line 9: L1 Summary
  if (ctx.l1Summary) {
    lines.push(`- L1 Rolling Summary: "${ctx.l1Summary}"`)
  }

  // Line 10: L2 Digest summary
  if (ctx.l2Digest?.psychologicalNotes) {
    lines.push(`- L2 Psychological Notes: "${ctx.l2Digest.psychologicalNotes}"`)
  }

  // Recent reflections (top 3)
  if (ctx.recentReflections.length > 0) {
    lines.push(`- Recent reflections: ${ctx.recentReflections.slice(0, 3).map((r) => `"${r.substring(0, 80)}"`).join(' | ')}`)
  }

  lines.push('[End of ALPHA MEMORY]')

  return lines.join('\n')
}
