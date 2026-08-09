import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/api-auth'

// ========================================
// Behavioral Analysis System Prompt
// ========================================

const BEHAVIORAL_ANALYSIS_PROMPT = `You are an AI Behavioral Analyst for a trading journal platform. Your job is to analyze a batch of recent trades and detect behavioral patterns that may indicate emotional or psychological issues affecting trading performance.

## Detection Categories

Analyze the trades for these behavioral patterns:

1. **REVENGE_TRADING** — Signs of re-entering after a loss with increased aggression:
   - Quick re-entry after a loss (next trade within hours)
   - Increased lot size after a losing trade
   - Emotional tags indicating frustration or anger
   - Trading outside of normal strategy

2. **FOMO** — Fear of Missing Out entries:
   - Entries during high volatility without clear setup
   - No clear strategy or plan noted
   - Chasing price movement (entering after significant move already happened)
   - Entries on pairs/timeframes not normally traded

3. **OVERCONFIDENCE** — Excessive confidence after wins:
   - Increasing lot size after consecutive wins
   - Relaxed or no stop loss after wins
   - Taking trades that don't meet usual criteria
   - Reduced process score while winning

4. **FEAR** — Fear-based trading decisions:
   - Very tight stop losses (too close to entry)
   - Early profitable exits before reaching take profit
   - Hesitation patterns (planned but didn't execute)
   - Extremely small position sizes relative to normal

5. **MOVING_STOP_LOSS** — Tampering with stop loss during trade:
   - Stop loss changes noted in trade data
   - Moving SL further away (widening risk)
   - Removing stop loss entirely

6. **EARLY_CLOSE** — Closing trades prematurely:
   - Exit before take profit hit while in profit
   - Multiple early exits in succession
   - Closing profitable trades at much less than planned TP

## Analysis Instructions

For each behavior detected, provide:
- **behaviorType**: One of the exact category names above
- **severity**: "LOW", "MEDIUM", "HIGH", or "CRITICAL" based on impact
- **confidence**: 0.0 to 1.0 based on how strong the evidence is
- **evidence**: A JSON object with specific evidence from the trades (trade IDs, amounts, patterns)
- **aiAnalysis**: A concise Indonesian explanation of what was detected and why it matters

## Output Format

Respond ONLY with a valid JSON array. No markdown, no code blocks, no extra text.

Example:
[
  {
    "behaviorType": "REVENGE_TRADING",
    "severity": "HIGH",
    "confidence": 0.85,
    "evidence": {"tradeIds": ["id1", "id2"], "pattern": "Increased lot size from 0.01 to 0.05 after -50 loss"},
    "aiAnalysis": "Terdeteksi peningkatan lot size 5x setelah loss besar. Ini menunjukkan kecenderungan revenge trading yang perlu diwaspadai."
  }
]

If no behavioral patterns are detected, return an empty array: []
`

// ========================================
// POST Handler
// ========================================

export async function POST(request: NextRequest) {
  const { error: authError } = await getAuthUser()
  if (authError) return authError

  try {
    const body = await request.json()
    const { traderId, days } = body as {
      traderId?: string
      days?: number
    }

    // If no traderId provided, use the first trader
    let trader = await db.trader.findFirst()
    if (!trader) {
      return NextResponse.json(
        { error: 'No trader found. Please create a trader first.' },
        { status: 404 }
      )
    }

    if (traderId) {
      trader = await db.trader.findUnique({ where: { id: traderId } }) || trader
    }

    const lookbackDays = days || 7
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - lookbackDays)

    // Fetch recent trades
    const recentTrades = await db.tradeEntry.findMany({
      where: {
        traderId: trader.id,
        deletedAt: null,
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: 'asc' },
    })

    if (recentTrades.length === 0) {
      return NextResponse.json({
        events: [],
        message: 'Tidak ada trade dalam periode yang dipilih.',
        tradesAnalyzed: 0,
      })
    }

    // Prepare trade data for LLM analysis
    const tradesData = recentTrades.map((trade) => ({
      id: trade.id,
      pair: trade.pair,
      direction: trade.direction,
      timeframe: trade.timeframe,
      strategy: trade.strategy,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      lotSize: trade.lotSize,
      profitLoss: trade.profitLoss,
      pipResult: trade.pipResult,
      status: trade.status,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      emotionBefore: trade.emotionBefore,
      emotionAfter: trade.emotionAfter,
      planNotes: trade.planNotes,
      tags: trade.tags ? JSON.parse(trade.tags) : [],
      behavioralTags: trade.behavioralTags ? JSON.parse(trade.behavioralTags) : [],
      hasReflected: trade.hasReflected,
      processScore: trade.processScore,
    }))

    // Call LLM for behavioral analysis
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: BEHAVIORAL_ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze the following ${tradesData.length} recent trades from the last ${lookbackDays} days for behavioral patterns.\n\nTrade Data:\n${JSON.stringify(tradesData, null, 2)}\n\nDetect any behavioral patterns and return a JSON array of detected events.`,
        },
      ],
    })

    // Extract text from response
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

    // Parse the behavioral events from LLM response
    let detectedEvents: Array<{
      behaviorType: string
      severity: string
      confidence: number
      evidence: Record<string, unknown>
      aiAnalysis: string
    }> = []

    try {
      // Try to extract JSON from the response (might have markdown code blocks)
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
        || responseText.match(/\[[\s\S]*\]/)

      const jsonStr = jsonMatch
        ? (jsonMatch[1] || jsonMatch[0])
        : responseText

      detectedEvents = JSON.parse(jsonStr.trim()) as typeof detectedEvents
    } catch {
      console.error('Failed to parse behavioral events:', responseText)
      detectedEvents = []
    }

    // Save detected events to database
    const savedEvents = []

    for (const event of detectedEvents) {
      // Validate the behavior type
      const validTypes = [
        'REVENGE_TRADING',
        'FOMO',
        'OVERCONFIDENCE',
        'FEAR',
        'MOVING_STOP_LOSS',
        'EARLY_CLOSE',
      ]

      if (!validTypes.includes(event.behaviorType)) continue
      if (event.confidence < 0.3) continue // Skip low confidence detections

      // Find associated trade IDs from evidence
      const evidenceTradeIds = (event.evidence?.tradeIds as string[]) || []

      // Create behavioral event record
      const saved = await db.behavioralEvent.create({
        data: {
          traderId: trader.id,
          tradeId: evidenceTradeIds[0] || null,
          behaviorType: event.behaviorType,
          severity: event.severity || 'MEDIUM',
          confidence: event.confidence,
          evidence: JSON.stringify(event.evidence || {}),
          aiAnalysis: event.aiAnalysis || null,
        },
      })
      savedEvents.push(saved)
    }

    // Fire L0 Memory Event for pattern detection (non-blocking)
    if (savedEvents.length > 0) {
      db.memoryL0Event.create({
        data: {
          traderId: trader.id,
          eventType: 'PatternDetected',
          eventData: JSON.stringify({
            behaviorTypes: savedEvents.map((e) => e.behaviorType),
            severities: savedEvents.map((e) => e.severity),
            tradesAnalyzed: recentTrades.length,
            period: lookbackDays,
          }),
        },
      }).catch(() => { /* non-blocking */ })
    }

    return NextResponse.json({
      events: savedEvents,
      rawAnalysis: detectedEvents,
      tradesAnalyzed: recentTrades.length,
      period: `Last ${lookbackDays} days`,
    })
  } catch (error) {
    console.error('Behavioral analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze behavioral patterns', events: [] },
      { status: 500 }
    )
  }
}
