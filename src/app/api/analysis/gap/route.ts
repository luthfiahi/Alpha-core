import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { requireTrader } from '@/lib/api-auth'

function safeJsonParse(str: string | null | undefined, fallback: unknown = []): unknown {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

// ========================================
// Gap Analysis System Prompt
// ========================================

const GAP_ANALYSIS_PROMPT = `You are an AI Gap Analyst for a trading journal platform. Your job is to analyze the gap between a trader's PLAN and EXECUTION, and identify reflection gaps.

## What You Analyze

Given a trade with its plan notes, execution data, emotions, reflections, and any linked behavioral events, you need to identify gaps.

## Gap Types

1. **PLAN_VS_EXECUTION** — The actual trade execution deviated from the stated plan.
   - Did the trade direction match the plan?
   - Was the entry timing according to plan?
   - Was the stop loss set per plan?
   - Was the take profit target met or was the trade closed early?

2. **NO_REFLECTION** — The trade has no meaningful reflection.
   - No reflection notes written
   - Hasn't been through the reflection flow
   - Missing emotion documentation

3. **EMOTION_IMPACT** — Emotions clearly impacted trading decisions.
   - emotionBefore/emotionAfter indicate strong emotional states
   - Emotions contradicted the plan
   - Emotional escalation visible in the trade

4. **RULE_VIOLATION** — Clear violation of trading rules/playbook.
   - Didn't follow linked playbook checklists
   - Traded outside of stated strategy
   - No stop loss or unreasonable risk

## Behavior Tags

Map each gap to a root-cause behavior tag:
- **FOMO** — Entered due to fear of missing out
- **REVENGE** — Re-entered after a loss with aggression
- **FEAR** — Closed early or didn't enter due to fear
- **OVERCONFIDENCE** — Relaxed rules after wins
- **IMPATIENCE** — Didn't wait for full setup confirmation
- **DISCIPLINE** — Followed the plan perfectly (positive)

## Analysis Instructions

For each gap found, provide:
- **gapType**: One of the exact types above
- **description**: Short Indonesian description of the gap
- **plan**: What was planned (from planNotes or inferred)
- **execution**: What actually happened
- **gapAnalysis**: AI explanation of why the gap exists and its implications
- **impact**: "HIGH", "MEDIUM", or "LOW"
- **recommendation**: Specific actionable recommendation in Indonesian
- **behaviorTag**: The root-cause behavior tag
- **severity**: "LOW", "MEDIUM", or "HIGH"

## Output Format

Respond ONLY with a valid JSON array. No markdown, no code blocks, no extra text.

Example:
[
  {
    "gapType": "PLAN_VS_EXECUTION",
    "description": "Entry dilakukan sebelum liquidity sweep, bertentangan dengan rencana",
    "plan": "Tunggu liquidity sweep di area 1.0850",
    "execution": "Entry LONG di 1.0865 sebelum sweep terjadi",
    "gapAnalysis": "Trader merasa takut ketinggalan dan entry lebih awal dari rencana. Ini menunjukkan FOMO yang mengorbankan proses.",
    "impact": "HIGH",
    "recommendation": "Tunggu konfirmasi MSS sebelum entry. Gunakan alarm untuk mengingatkan saat harga mendekati area sweep.",
    "behaviorTag": "FOMO",
    "severity": "HIGH"
  }
]

If no gaps are found, return an empty array: []
`

// ========================================
// POST Handler — Analyze trade for gaps
// ========================================

export async function POST(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    const body = await request.json()
    const { tradeId } = body as {
      tradeId: string
    }

    if (!tradeId) {
      return NextResponse.json(
        { error: 'tradeId is required' },
        { status: 400 }
      )
    }

    // Fetch the trade with related data
    const trade = await db.tradeEntry.findFirst({
      where: { id: tradeId, traderId: trader.id },
      include: {
        playbook: {
          include: {
            checklists: {
              include: { items: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Fetch behavioral events linked to this trade
    const behavioralEvents = await db.behavioralEvent.findMany({
      where: {
        traderId: trade.traderId,
        tradeId: trade.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Build trade context for LLM
    const tradeContext = {
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
      planNotes: trade.planNotes,
      reflectionNotes: trade.reflectionNotes,
      emotionBefore: trade.emotionBefore,
      emotionAfter: trade.emotionAfter,
      hasReflected: trade.hasReflected,
      processScore: trade.processScore,
      behavioralTags: safeJsonParse(trade.behavioralTags, []),
      playbookCompliance: trade.playbookCompliance,
      playbook: trade.playbook
        ? {
            name: trade.playbook.name,
            sessionType: trade.playbook.sessionType,
            checklists: trade.playbook.checklists.map((c) => ({
              title: c.title,
              items: c.items.map((i) => i.text),
            })),
          }
        : null,
    }

    const behavioralContext = behavioralEvents.map((e) => ({
      behaviorType: e.behaviorType,
      severity: e.severity,
      confidence: e.confidence,
      aiAnalysis: e.aiAnalysis,
      resolved: e.resolved,
    }))

    // Call LLM for gap analysis
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: GAP_ANALYSIS_PROMPT },
        {
          role: 'user',
          content: `Analyze the following trade for reflection gaps.

Trade Data:
${JSON.stringify(tradeContext, null, 2)}

Linked Behavioral Events:
${JSON.stringify(behavioralContext, null, 2)}

Identify all gaps between plan and execution. Return a JSON array of gap analyses.`,
        },
      ],
    })

    // Extract response text
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

    // Parse gap analyses
    let gapAnalyses: Array<{
      gapType: string
      description: string
      plan: string
      execution: string
      gapAnalysis: string
      impact: string
      recommendation: string
      behaviorTag: string
      severity: string
    }> = []

    try {
      const jsonMatch =
        responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
        responseText.match(/\[[\s\S]*\]/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      gapAnalyses = JSON.parse(jsonStr.trim()) as typeof gapAnalyses
    } catch {
      console.error('Failed to parse gap analyses:', responseText)
      gapAnalyses = []
    }

    // Validate and save to DB
    const validGapTypes = ['PLAN_VS_EXECUTION', 'NO_REFLECTION', 'EMOTION_IMPACT', 'RULE_VIOLATION']
    const validImpacts = ['HIGH', 'MEDIUM', 'LOW']
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH']
    const validBehaviorTags = ['FOMO', 'REVENGE', 'FEAR', 'OVERCONFIDENCE', 'IMPATIENCE', 'DISCIPLINE']

    const savedGaps = []

    for (const gap of gapAnalyses) {
      if (!validGapTypes.includes(gap.gapType)) continue

      const saved = await db.reflectionGapRecord.create({
        data: {
          traderId: trade.traderId,
          tradeId: trade.id,
          gapType: gap.gapType,
          description: gap.description,
          plan: gap.plan || null,
          execution: gap.execution || null,
          gapAnalysis: gap.gapAnalysis || null,
          impact: validImpacts.includes(gap.impact) ? gap.impact : 'MEDIUM',
          recommendation: gap.recommendation || null,
          behaviorTag: validBehaviorTags.includes(gap.behaviorTag) ? gap.behaviorTag : null,
          severity: validSeverities.includes(gap.severity) ? gap.severity : 'MEDIUM',
        },
      })
      savedGaps.push(saved)
    }

    return NextResponse.json({
      gaps: savedGaps,
      rawAnalysis: gapAnalyses,
      tradeId: trade.id,
    })
  } catch (error) {
    console.error('Gap analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze trade gaps' },
      { status: 500 }
    )
  }
}

// ========================================
// GET Handler — List all gap records
// ========================================

export async function GET(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    const { searchParams } = new URL(request.url)
    const gapType = searchParams.get('gapType')
    const resolved = searchParams.get('resolved')
    const severity = searchParams.get('severity')
    const where: Record<string, unknown> = { traderId: trader.id }
    if (gapType) where.gapType = gapType
    if (resolved === 'true') where.resolved = true
    if (resolved === 'false') where.resolved = false
    if (severity) where.severity = severity

    const gaps = await db.reflectionGapRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ gaps })
  } catch (error) {
    console.error('Gap list API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gap records' },
      { status: 500 }
    )
  }
}
