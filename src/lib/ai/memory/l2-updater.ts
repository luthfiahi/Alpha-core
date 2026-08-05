// ========================================
// AI Memory System — L2 Long-term Digest Updater
// Task 17: Generates/updates the long-term L2 digest
// ========================================

import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import { computeTrend } from './types'

const L2_DIGEST_PROMPT = `You are an AI memory analyst for a trading coach platform. Your task is to analyze a trader's accumulated data and produce a long-term psychological and behavioral digest.

Given the aggregated trader data below, produce a JSON object with the following fields:
{
  "tradingStyle": "SCALPER" | "DAY_TRADER" | "SWING" | "POSITION",
  "dominantEmotions": ["emotion1", "emotion2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "bestSetup": "setup name or null",
  "bestSession": "LONDON" | "NEW_YORK" | "ASIAN" | "CUSTOM" | null,
  "bestRiskReward": "1:R format or null",
  "readinessTrend": "IMPROVING" | "STABLE" | "DECLINING",
  "psychologicalNotes": "2-3 sentence psychological profile of this trader"
}

Guidelines:
- tradingStyle: Determine from average trade duration and timeframe. Scalper = M1-M15, Day Trader = M15-H1, Swing = H1-D1, Position = D1+
- dominantEmotions: Top 2-3 emotions from the data. Use lowercase.
- strengths: 2-4 specific process strengths (e.g., "Patient with setups", "Good risk management", "Consistent journaling")
- weaknesses: 2-4 specific areas to improve (e.g., "Early close on profit", "FOMO during London open")
- bestSetup: The playbook or strategy with highest win rate or most consistent execution
- bestSession: The session with best performance
- bestRiskReward: The average or best risk-reward ratio observed
- readinessTrend: Based on process score trajectory and behavioral event frequency
- psychologicalNotes: A concise psychological profile — personality traits, emotional patterns, decision-making style

Respond ONLY with valid JSON. No markdown, no code blocks, no extra text.`

/**
 * Updates the L2 long-term digest for a trader.
 * Analyzes all accumulated data and uses LLM to identify patterns.
 * Returns the updated L2 digest.
 */
export async function updateL2Digest(traderId?: string): Promise<ReturnType<typeof upsertL2>> {
  // Resolve trader
  let trader
  if (traderId) {
    trader = await db.trader.findUnique({ where: { id: traderId } })
  }
  if (!trader) {
    trader = await db.trader.findFirst()
  }
  if (!trader) {
    return null
  }

  const tid = trader.id

  // ---- Gather all data ----
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [
    allTrades,
    behavioralEvents,
    processScores,
    playbookStats,
    growthSnapshots,
  ] = await Promise.all([
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null, createdAt: { gte: ninetyDaysAgo } },
      orderBy: { createdAt: 'asc' },
      include: { playbook: { select: { name: true, sessionType: true } } },
    }),
    db.behavioralEvent.findMany({
      where: { traderId: tid, createdAt: { gte: ninetyDaysAgo } },
    }),
    db.processScoreSnapshot.findMany({
      where: { traderId: tid },
      orderBy: { createdAt: 'asc' },
    }),
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null, playbookId: { not: null } },
      include: { playbook: { select: { name: true, sessionType: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    db.growthSnapshot.findMany({
      where: { traderId: tid, createdAt: { gte: ninetyDaysAgo } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // Need at least some data to analyze
  if (allTrades.length < 3) {
    return upsertL2(tid, {
      totalTradesAnalyzed: allTrades.length,
      analysisPeriod: 'insufficient data',
      psychologicalNotes: 'Not enough data to generate a psychological profile. Need at least 3 trades.',
    })
  }

  // ---- Aggregate data for LLM ----

  // 1. Timeframe distribution (for trading style)
  const timeframeCounts = new Map<string, number>()
  for (const t of allTrades) {
    if (t.timeframe) {
      timeframeCounts.set(t.timeframe, (timeframeCounts.get(t.timeframe) || 0) + 1)
    }
  }
  const topTimeframes = Array.from(timeframeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tf, count]) => `${tf}: ${count}`)

  // 2. Trade duration (approximate from entry/exit time)
  const durations: number[] = []
  for (const t of allTrades) {
    if (t.entryTime && t.exitTime) {
      durations.push(t.exitTime.getTime() - t.entryTime.getTime())
    }
  }
  const avgDurationMs = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0
  const avgDurationHours = avgDurationMs / (1000 * 60 * 60)

  // 3. Emotion distribution
  const emotionCounts = new Map<string, number>()
  for (const t of allTrades) {
    if (t.emotionBefore) emotionCounts.set(t.emotionBefore, (emotionCounts.get(t.emotionBefore) || 0) + 1)
    if (t.emotionAfter) emotionCounts.set(t.emotionAfter, (emotionCounts.get(t.emotionAfter) || 0) + 1)
  }
  const emotionDistribution = Array.from(emotionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => `${emotion}: ${count}`)

  // 4. Win rate by playbook
  const playbookPerf = new Map<string, { wins: number; total: number; compliance: number[] }>()
  for (const t of playbookStats) {
    const name = t.playbook?.name || 'Unknown'
    const existing = playbookPerf.get(name) || { wins: 0, total: 0, compliance: [] }
    existing.total++
    if (t.profitLoss > 0) existing.wins++
    if (t.playbookCompliance !== null && t.playbookCompliance !== undefined) {
      existing.compliance.push(t.playbookCompliance)
    }
    playbookPerf.set(name, existing)
  }
  const playbookPerformance = Array.from(playbookPerf.entries()).map(([name, data]) => ({
    name,
    winRate: data.total > 0 ? ((data.wins / data.total) * 100).toFixed(1) : '0',
    total: data.total,
    avgCompliance: data.compliance.length > 0
      ? (data.compliance.reduce((a, b) => a + b, 0) / data.compliance.length * 100).toFixed(0)
      : 'N/A',
  }))

  // 5. Session performance
  const sessionPerf = new Map<string, { wins: number; total: number; pnl: number }>()
  for (const t of allTrades) {
    const session = t.playbook?.sessionType || 'UNKNOWN'
    const existing = sessionPerf.get(session) || { wins: 0, total: 0, pnl: 0 }
    existing.total++
    if (t.profitLoss > 0) existing.wins++
    existing.pnl += t.profitLoss
    sessionPerf.set(session, existing)
  }
  const sessionPerformance = Array.from(sessionPerf.entries()).map(([session, data]) => ({
    session,
    winRate: data.total > 0 ? ((data.wins / data.total) * 100).toFixed(1) : '0',
    total: data.total,
    pnl: data.pnl.toFixed(2),
  }))

  // 6. Risk-Reward calculation
  const rrValues: string[] = []
  for (const t of allTrades) {
    if (t.entryPrice && t.stopLoss && t.takeProfit && t.direction) {
      const risk = Math.abs(t.entryPrice - t.stopLoss)
      const reward = Math.abs(t.takeProfit - t.entryPrice)
      if (risk > 0) {
        const rr = reward / risk
        rrValues.push(`1:${rr.toFixed(1)}`)
      }
    }
  }

  // 7. Behavioral summary
  const behaviorSummary = new Map<string, { count: number; resolved: number; severity: Map<string, number> }>()
  for (const e of behavioralEvents) {
    const existing = behaviorSummary.get(e.behaviorType) || { count: 0, resolved: 0, severity: new Map() }
    existing.count++
    if (e.resolved) existing.resolved++
    const sevMap = existing.severity
    sevMap.set(e.severity, (sevMap.get(e.severity) || 0) + 1)
    behaviorSummary.set(e.behaviorType, existing)
  }
  const behaviorReport = Array.from(behaviorSummary.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    resolved: data.resolved,
    topSeverity: Array.from(data.severity.entries()).sort((a, b) => b[1] - a[1])[0]?.[0],
  }))

  // 8. Process score trend
  const psScores = processScores.map((s) => s.score)
  const psTrend = computeTrend(psScores)

  // 9. Growth scores
  const latestGrowth = growthSnapshots.length > 0 ? growthSnapshots[growthSnapshots.length - 1] : null

  // ---- Build input for LLM ----
  const inputText = `
## Trader Data (Last 90 Days)

### Trade Overview
- Total trades: ${allTrades.length}
- Win rate: ${allTrades.length > 0 ? ((allTrades.filter(t => t.profitLoss > 0).length / allTrades.length) * 100).toFixed(1) : 0}%
- Total P/L: $${allTrades.reduce((s, t) => s + t.profitLoss, 0).toFixed(2)}
- Average Process Score: ${allTrades.length > 0 ? (allTrades.reduce((s, t) => s + (t.processScore || 0), 0) / allTrades.length).toFixed(0) : 0}/100
- Reflected: ${allTrades.filter(t => t.hasReflected).length}/${allTrades.length}

### Timeframe Distribution
${topTimeframes.join(', ') || 'No timeframe data'}

### Average Trade Duration
${avgDurationHours > 0 ? `${avgDurationHours.toFixed(1)} hours` : 'Unknown (open trades or missing times)'}

### Emotion Distribution
${emotionDistribution.join(', ') || 'No emotion data'}

### Playbook Performance
${playbookPerformance.length > 0 ? JSON.stringify(playbookPerformance) : 'No playbook data'}

### Session Performance
${sessionPerformance.length > 0 ? JSON.stringify(sessionPerformance) : 'No session data'}

### Risk-Reward Ratios (sample)
${rrValues.length > 0 ? rrValues.slice(0, 20).join(', ') : 'No R/R data'}

### Behavioral Report
${JSON.stringify(behaviorReport)}

### Process Score Trend
${psTrend} (scores: ${psScores.length > 0 ? `${psScores[0]} → ${psScores[psScores.length - 1]}` : 'no data'})

### Latest Growth Scores
${latestGrowth ? `Emotion: ${latestGrowth.emotionScore}, Consistency: ${latestGrowth.consistencyScore}, Process: ${latestGrowth.processScore}, Behavior: ${latestGrowth.behaviorScore}, Discipline: ${latestGrowth.disciplineScore}, Risk Mgmt: ${latestGrowth.riskMgmtScore}` : 'No growth data'}
`

  // Call LLM
  const zai = await ZAI.create()
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: L2_DIGEST_PROMPT },
      { role: 'user', content: inputText },
    ],
  })

  // Extract text
  let responseText = ''
  if (typeof response === 'string') {
    responseText = response
  } else if (response && typeof response === 'object') {
    const resp = response as unknown as {
      content?: string
      choices?: Array<{ message?: { content?: string } }>
    }
    responseText = resp.content || resp.choices?.[0]?.message?.content || ''
  }

  // Parse JSON from response
  let parsed: Record<string, unknown> = {}
  try {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      || responseText.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
    parsed = JSON.parse(jsonStr.trim()) as Record<string, unknown>
  } catch {
    console.error('Failed to parse L2 digest JSON:', responseText.substring(0, 200))
  }

  // Build the update data
  const updateData: Record<string, unknown> = {
    totalTradesAnalyzed: allTrades.length,
    analysisPeriod: '3 months',
  }

  if (parsed.tradingStyle) updateData.tradingStyle = parsed.tradingStyle as string
  if (Array.isArray(parsed.dominantEmotions)) {
    updateData.dominantEmotions = JSON.stringify(parsed.dominantEmotions)
  }
  if (Array.isArray(parsed.strengths)) {
    updateData.strengths = JSON.stringify(parsed.strengths)
  }
  if (Array.isArray(parsed.weaknesses)) {
    updateData.weaknesses = JSON.stringify(parsed.weaknesses)
  }
  if (parsed.bestSetup) updateData.bestSetup = parsed.bestSetup as string
  if (parsed.bestSession) updateData.bestSession = parsed.bestSession as string
  if (parsed.bestRiskReward) updateData.bestRiskReward = parsed.bestRiskReward as string
  if (parsed.readinessTrend) updateData.readinessTrend = parsed.readinessTrend as string
  if (parsed.psychologicalNotes) updateData.psychologicalNotes = parsed.psychologicalNotes as string

  return upsertL2(tid, updateData)
}

async function upsertL2(traderId: string, data: Record<string, unknown>) {
  const existing = await db.memoryL2Digest.findUnique({ where: { traderId } })

  if (existing) {
    return db.memoryL2Digest.update({
      where: { traderId },
      data,
    })
  } else {
    return db.memoryL2Digest.create({
      data: { traderId, ...data },
    })
  }
}
