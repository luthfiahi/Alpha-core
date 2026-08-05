// ========================================
// AI Memory System — L1 Rolling Summary Updater
// Task 17: Generates/updates the L1 rolling summary
// ========================================

import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const L1_SUMMARY_PROMPT = `You are an AI memory system for a trading coach platform. Your task is to generate a concise rolling summary of a trader's recent activity (last 7 days).

Given the recent events and aggregated data, write a 2-4 sentence summary that captures:
1. What the trader has been doing (trading activity, coaching sessions, reflections)
2. Key patterns or notable events (behavioral detections, process score changes)
3. Overall mood/trajectory (improving, struggling, stable)

Rules:
- Be factual and data-driven
- Use English
- Keep it under 100 words
- Do NOT give trading advice
- Focus on the trader's PROCESS, not market direction
- Mention specific numbers (trades, scores, events)

Output ONLY the summary text. No preamble, no markdown.`

/**
 * Updates the L1 rolling summary for a trader.
 * Fetches recent L0 events and trade data, sends to LLM for summarization.
 * Returns the updated summary string.
 */
export async function updateL1Summary(traderId?: string): Promise<string> {
  // Resolve trader
  let trader
  if (traderId) {
    trader = await db.trader.findUnique({ where: { id: traderId } })
  }
  if (!trader) {
    trader = await db.trader.findFirst()
  }
  if (!trader) {
    return 'No trader data available.'
  }

  const tid = trader.id

  // Fetch L0 events from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [l0Events, recentTrades, recentBehavioralEvents] = await Promise.all([
    db.memoryL0Event.findMany({
      where: { traderId: tid, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'asc' },
    }),
    db.tradeEntry.findMany({
      where: { traderId: tid, deletedAt: null, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'asc' },
    }),
    db.behavioralEvent.findMany({
      where: { traderId: tid, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // If there's very little activity, return a simple summary
  if (l0Events.length === 0 && recentTrades.length === 0) {
    const summary = 'No trading activity in the last 7 days.'
    await upsertL1(tid, summary, sevenDaysAgo)
    return summary
  }

  // Build the context for LLM
  const eventSummaries = l0Events.map((e) => {
    const date = e.createdAt.toISOString().split('T')[0]
    let detail = ''
    try {
      const data = JSON.parse(e.eventData)
      // Extract only key fields to keep prompt compact
      if (data.pair) detail += ` ${data.pair} ${data.direction || ''}`
      if (data.profitLoss !== undefined) detail += ` P/L: ${data.profitLoss}`
      if (data.behaviorType) detail += ` [${data.behaviorType}]`
      if (data.sessionType) detail += ` (${data.sessionType})`
    } catch {
      // ignore parse errors
    }
    return `${date}: ${e.eventType}${detail}`
  })

  // Aggregate trade stats
  const tradeWins = recentTrades.filter((t) => t.profitLoss > 0).length
  const totalPnL = recentTrades.reduce((s, t) => s + t.profitLoss, 0)
  const avgScore = recentTrades.length > 0
    ? Math.round(recentTrades.reduce((s, t) => s + (t.processScore || 0), 0) / recentTrades.length)
    : 0
  const reflectedCount = recentTrades.filter((t) => t.hasReflected).length

  const behaviorSummary = recentBehavioralEvents.length > 0
    ? recentBehavioralEvents.map((e) => `${e.behaviorType} (${e.severity})`).join(', ')
    : 'None detected'

  const inputText = `
## Recent Events (Last 7 Days)
${eventSummaries.length > 0 ? eventSummaries.join('\n') : 'No L0 events recorded.'}

## Trade Summary
- Trades taken: ${recentTrades.length}
- Win/Loss: ${tradeWins}/${recentTrades.length - tradeWins}
- Total P/L: $${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
- Avg Process Score: ${avgScore}/100
- Trades reflected: ${reflectedCount}/${recentTrades.length}

## Behavioral Events
${behaviorSummary}
`

  // Call LLM
  const zai = await ZAI.create()
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: L1_SUMMARY_PROMPT },
      { role: 'user', content: inputText },
    ],
  })

  // Extract text
  let summaryText = ''
  if (typeof response === 'string') {
    summaryText = response
  } else if (response && typeof response === 'object') {
    const resp = response as unknown as {
      content?: string
      choices?: Array<{ message?: { content?: string } }>
    }
    summaryText = resp.content || resp.choices?.[0]?.message?.content || ''
  }

  // Clean up any markdown wrapping
  summaryText = summaryText.trim().replace(/^```(?:json|text)?\s*/i, '').replace(/\s*```$/i, '').trim()

  // Fallback if LLM returns nothing
  if (!summaryText) {
    summaryText = `Trader completed ${recentTrades.length} trades in the last 7 days with ${tradeWins} wins. ${recentBehavioralEvents.length} behavioral events detected.`
  }

  // Upsert the L1 summary
  await upsertL1(tid, summaryText, sevenDaysAgo)

  return summaryText
}

async function upsertL1(traderId: string, summary: string, periodStart: Date) {
  const existing = await db.memoryL1Summary.findUnique({ where: { traderId } })

  if (existing) {
    await db.memoryL1Summary.update({
      where: { traderId },
      data: {
        summary,
        periodStart,
        periodEnd: new Date(),
      },
    })
  } else {
    await db.memoryL1Summary.create({
      data: {
        traderId,
        summary,
        periodStart,
        periodEnd: new Date(),
      },
    })
  }
}
