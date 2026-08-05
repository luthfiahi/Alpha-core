import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

// ========================================
// Growth Report Generation System Prompt
// ========================================

const GROWTH_REPORT_PROMPT = `You are an AI Growth Analyst for a trading journal platform. Your job is to generate a comprehensive growth report for a period (weekly or monthly).

## Output Format

Respond ONLY with valid JSON. No markdown, no code blocks, no extra text.

{
  "totalTrades": number,
  "processScore": number (0-100),
  "processScoreChange": number (+/- from previous),
  "winRate": number (percentage),
  "totalPnL": number,
  "ruleCompliance": number (0-100%),
  "playbookUsage": number (0-100%),
  "behaviorsImproved": ["item 1 in Indonesian", ...],
  "behaviorsToImprove": ["item 1 in Indonesian", ...],
  "nextPeriodTargets": ["target 1 in Indonesian", ...],
  "aiSummary": "Full report summary in Indonesian. 3-5 sentences analyzing the period.",
  "highlight": "Key highlight of the period in Indonesian. 1-2 sentences."
}

## Analysis Guidelines

1. **processScore**: Calculate based on discipline, consistency, reflection quality, and risk management.
2. **processScoreChange**: Compare with the previous period's score.
3. **winRate**: Trades won / total closed trades.
4. **behaviorsImproved**: Behaviors that showed improvement vs previous period.
5. **behaviorsToImprove**: Behavioral issues that still need work.
6. **nextPeriodTargets**: 2-3 specific, actionable targets for next period.
7. **aiSummary**: Write a comprehensive but concise summary. Use Indonesian.
8. **highlight**: The single most notable achievement or observation.
`

// ========================================
// GET Handler — List growth reports
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const traderId = searchParams.get('traderId')
    const reportType = searchParams.get('reportType')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Get trader
    let trader = await db.trader.findFirst()
    if (!trader) {
      return NextResponse.json({ reports: [] })
    }
    if (traderId) {
      trader = await db.trader.findUnique({ where: { id: traderId } }) || trader
    }

    const where: Record<string, unknown> = { traderId: trader.id }
    if (reportType) where.reportType = reportType

    const reports = await db.growthReport.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Growth report list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch growth reports' },
      { status: 500 }
    )
  }
}

// ========================================
// POST Handler — Generate a new growth report
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { traderId, reportType, periodStart, periodEnd } = body as {
      traderId?: string
      reportType?: 'WEEKLY' | 'MONTHLY'
      periodStart?: string
      periodEnd?: string
    }

    // Get trader
    let trader = await db.trader.findFirst()
    if (!trader) {
      return NextResponse.json({ error: 'No trader found' }, { status: 404 })
    }
    if (traderId) {
      trader = await db.trader.findUnique({ where: { id: traderId } }) || trader
    }

    // Determine period
    const type = reportType || 'WEEKLY'
    const now = new Date()
    const pStart = periodStart || (() => {
      if (type === 'MONTHLY') {
        const d = new Date(now.getFullYear(), now.getMonth(), 1)
        return d.toISOString().split('T')[0]
      }
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()
    const pEnd = periodEnd || now.toISOString().split('T')[0]

    // Fetch trades in the period
    const startDate = new Date(pStart)
    const endDate = new Date(pEnd + 'T23:59:59.999Z')

    const trades = await db.tradeEntry.findMany({
      where: {
        traderId: trader.id,
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'asc' },
    })

    const behavioralEvents = await db.behavioralEvent.findMany({
      where: {
        traderId: trader.id,
        createdAt: { gte: startDate, lte: endDate },
      },
    })

    const gaps = await db.reflectionGapRecord.findMany({
      where: {
        traderId: trader.id,
        createdAt: { gte: startDate, lte: endDate },
      },
    })

    // Previous period for comparison
    const periodDays = type === 'MONTHLY' ? 30 : 7
    const prevStart = new Date(startDate)
    prevStart.setDate(prevStart.getDate() - periodDays)

    const prevTrades = await db.tradeEntry.findMany({
      where: {
        traderId: trader.id,
        deletedAt: null,
        createdAt: { gte: prevStart, lt: startDate },
      },
    })

    const prevAvgScore = prevTrades.length > 0
      ? prevTrades.reduce((s, t) => s + (t.processScore || 0), 0) / prevTrades.length
      : 0

    const currAvgScore = trades.length > 0
      ? trades.reduce((s, t) => s + (t.processScore || 0), 0) / trades.length
      : 0

    // Prepare data for LLM
    const tradesData = trades.map((t) => ({
      pair: t.pair,
      direction: t.direction,
      strategy: t.strategy,
      profitLoss: t.profitLoss,
      processScore: t.processScore,
      status: t.status,
      hasReflected: t.hasReflected,
      emotionBefore: t.emotionBefore,
      emotionAfter: t.emotionAfter,
      playbookCompliance: t.playbookCompliance,
    }))

    // Call LLM
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: GROWTH_REPORT_PROMPT },
        {
          role: 'user',
          content: `Generate a ${type.toLowerCase()} growth report for this trader.

Period: ${pStart} to ${pEnd}
Type: ${type}

Current Period Trades (${trades.length}):
${JSON.stringify(tradesData, null, 2)}

Behavioral Events (${behavioralEvents.length}):
${behavioralEvents.map((e) => `- ${e.behaviorType} (${e.severity}, confidence: ${e.confidence})`).join('\n')}

Reflection Gaps (${gaps.length}):
${gaps.map((g) => `- ${g.gapType} (${g.impact}, ${g.behaviorTag})`).join('\n')}

Previous Period (${prevTrades.length} trades):
Average Process Score: ${Math.round(prevAvgScore)}

Current Period Stats:
Average Process Score: ${Math.round(currAvgScore)}
Process Score Change: ${Math.round(currAvgScore - prevAvgScore)}

Return the growth report as JSON.`,
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

    // Parse report
    let reportData: {
      totalTrades?: number
      processScore?: number
      processScoreChange?: number
      winRate?: number
      totalPnL?: number
      ruleCompliance?: number
      playbookUsage?: number
      behaviorsImproved?: string[]
      behaviorsToImprove?: string[]
      nextPeriodTargets?: string[]
      aiSummary?: string
      highlight?: string
    } = {}

    try {
      const jsonMatch =
        responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
        responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      reportData = JSON.parse(jsonStr.trim()) as typeof reportData
    } catch {
      console.error('Failed to parse growth report:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse AI-generated report', raw: responseText },
        { status: 500 }
      )
    }

    // Save to database
    const report = await db.growthReport.create({
      data: {
        traderId: trader.id,
        reportType: type,
        periodStart: pStart,
        periodEnd: pEnd,
        totalTrades: reportData.totalTrades || trades.length,
        processScore: reportData.processScore || 0,
        processScoreChange: reportData.processScoreChange ?? Math.round(currAvgScore - prevAvgScore),
        winRate: reportData.winRate || null,
        totalPnL: reportData.totalPnL ?? trades.reduce((s, t) => s + t.profitLoss, 0),
        ruleCompliance: reportData.ruleCompliance || null,
        playbookUsage: reportData.playbookUsage || null,
        behaviorsImproved: reportData.behaviorsImproved ? JSON.stringify(reportData.behaviorsImproved) : null,
        behaviorsToImprove: reportData.behaviorsToImprove ? JSON.stringify(reportData.behaviorsToImprove) : null,
        nextWeekTargets: reportData.nextPeriodTargets ? JSON.stringify(reportData.nextPeriodTargets) : null,
        aiSummary: reportData.aiSummary || null,
        highlight: reportData.highlight || null,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Growth report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate growth report' },
      { status: 500 }
    )
  }
}
