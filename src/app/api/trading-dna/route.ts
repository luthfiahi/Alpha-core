import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { requireTrader } from '@/lib/api-auth'

function safeJsonParse(str: string | null | undefined, fallback: unknown = []): unknown {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

// ========================================
// Trading DNA Generation System Prompt
// ========================================

const DNA_GENERATION_PROMPT = `You are an AI Trading Analyst. Your job is to analyze a trader's complete trading history and generate a comprehensive "Trading DNA" profile — a unique identity fingerprint of their trading style, strengths, weaknesses, and patterns.

## What You Analyze

Given the trader's trades, behavioral events, growth snapshots, weekly reviews, and playbook usage, create a complete Trading DNA profile.

## Output Format

Respond ONLY with valid JSON. No markdown, no code blocks, no extra text.

{
  "tradingStyle": "SCALPER" | "DAY_TRADER" | "SWING" | "POSITION",
  "dominantEmotion": "FEAR" | "GREED" | "PATIENCE" | "DISCIPLINE" | "ANXIETY" | "CONFIDENCE",
  "strengths": ["strength 1 in Indonesian", "strength 2", ...],
  "weaknesses": ["weakness 1 in Indonesian", "weakness 2", ...],
  "bestSetup": "nama setup terbaik",
  "bestSession": "LONDON" | "NEW_YORK" | "ASIAN",
  "bestRiskReward": "1:R format",
  "bestPair": "PAIR format",
  "worstSetup": "nama setup terburuk",
  "worstSession": "LONDON" | "NEW_YORK" | "ASIAN",
  "totalTradesAnalyzed": number,
  "analysisPeriod": "period description in Indonesian",
  "aiSummary": "Full paragraph in Indonesian describing the trader's identity, their journey, their unique characteristics as a trader. Write in a warm, insightful tone. 3-5 sentences."
}

## Analysis Guidelines

1. **Trading Style**: Determine based on timeframe distribution, holding duration, and trade frequency.
2. **Dominant Emotion**: The emotion that most frequently appears in their trades (emotionBefore/emotionAfter).
3. **Strengths**: 3-5 things the trader does well consistently. Write in Indonesian.
4. **Weaknesses**: 3-5 areas for improvement. Write in Indonesian.
5. **Best/Worst Setup**: Based on win rate and process score by strategy.
6. **Best/Worst Session**: Based on performance by time of entry.
7. **Best R:R**: Based on actual achieved risk-reward ratios.
8. **Best Pair**: The pair with best performance.
9. **AI Summary**: Write a cohesive paragraph that captures the trader's identity. Mention their style, what makes them unique, and their growth trajectory. Use Indonesian.
`

// ========================================
// GET Handler — Get current trader's DNA
// ========================================

export async function GET(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    const dna = await db.tradingDNA.findUnique({
      where: { traderId: trader.id },
    })

    if (!dna) {
      return NextResponse.json({ dna: null, message: 'DNA belum di-generate. Klik "Generate DNA" untuk memulai.' })
    }

    return NextResponse.json({ dna })
  } catch (error) {
    console.error('Trading DNA GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch Trading DNA' }, { status: 500 })
  }
}

// ========================================
// POST Handler — Generate/regenerate DNA
// ========================================

export async function POST(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    // Fetch all trader data for comprehensive analysis
    const trades = await db.tradeEntry.findMany({
      where: { traderId: trader.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    if (trades.length < 5) {
      return NextResponse.json(
        { error: 'Minimal 5 trade diperlukan untuk generate Trading DNA.' },
        { status: 400 }
      )
    }

    const behavioralEvents = await db.behavioralEvent.findMany({
      where: { traderId: trader.id },
      orderBy: { createdAt: 'desc' },
    })

    const growthSnapshots = await db.growthSnapshot.findMany({
      where: { traderId: trader.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const weeklyReviews = await db.weeklyReviewRecord.findMany({
      where: { traderId: trader.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    const reflectionGaps = await db.reflectionGapRecord.findMany({
      where: { traderId: trader.id },
      orderBy: { createdAt: 'desc' },
    })

    // Prepare data for LLM
    const tradesData = trades.map((t) => ({
      pair: t.pair,
      direction: t.direction,
      timeframe: t.timeframe,
      strategy: t.strategy,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      stopLoss: t.stopLoss,
      takeProfit: t.takeProfit,
      lotSize: t.lotSize,
      profitLoss: t.profitLoss,
      status: t.status,
      entryTime: t.entryTime,
      exitTime: t.exitTime,
      emotionBefore: t.emotionBefore,
      emotionAfter: t.emotionAfter,
      processScore: t.processScore,
      tags: safeJsonParse(t.tags, []),
    }))

    const behaviorData = behavioralEvents.map((e) => ({
      behaviorType: e.behaviorType,
      severity: e.severity,
      confidence: e.confidence,
    }))

    const gapData = reflectionGaps.map((g) => ({
      gapType: g.gapType,
      impact: g.impact,
      behaviorTag: g.behaviorTag,
      severity: g.severity,
    }))

    const latestGrowth = growthSnapshots.length > 0
      ? growthSnapshots[0]
      : null

    // Call LLM
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: DNA_GENERATION_PROMPT },
        {
          role: 'user',
          content: `Generate Trading DNA for this trader.

Total Trades: ${trades.length}

Recent Trades:
${JSON.stringify(tradesData.slice(0, 30), null, 2)}

Behavioral Events (${behaviorData.length}):
${JSON.stringify(behaviorData, null, 2)}

Reflection Gaps (${gapData.length}):
${JSON.stringify(gapData, null, 2)}

Latest Growth Snapshot:
${latestGrowth ? JSON.stringify(latestGrowth, null, 2) : 'No data'}

Weekly Reviews (${weeklyReviews.length}):
${weeklyReviews.map((w) => `- Score: ${w.processScore}, Win Rate: ${w.winRate}%, Trades: ${w.totalTrades}`).join('\n')}

Analyze this data and return the Trading DNA profile as JSON.`,
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

    // Parse DNA
    let dnaData: {
      tradingStyle?: string
      dominantEmotion?: string
      strengths?: string[]
      weaknesses?: string[]
      bestSetup?: string
      bestSession?: string
      bestRiskReward?: string
      bestPair?: string
      worstSetup?: string
      worstSession?: string
      totalTradesAnalyzed?: number
      analysisPeriod?: string
      aiSummary?: string
    } = {}

    try {
      const jsonMatch =
        responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
        responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      dnaData = JSON.parse(jsonStr.trim()) as typeof dnaData
    } catch {
      console.error('Failed to parse DNA:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse AI-generated DNA', raw: responseText },
        { status: 500 }
      )
    }

    // Upsert to database
    const dna = await db.tradingDNA.upsert({
      where: { traderId: trader.id },
      update: {
        tradingStyle: dnaData.tradingStyle || null,
        dominantEmotion: dnaData.dominantEmotion || null,
        strengths: dnaData.strengths ? JSON.stringify(dnaData.strengths) : null,
        weaknesses: dnaData.weaknesses ? JSON.stringify(dnaData.weaknesses) : null,
        bestSetup: dnaData.bestSetup || null,
        bestSession: dnaData.bestSession || null,
        bestRiskReward: dnaData.bestRiskReward || null,
        bestPair: dnaData.bestPair || null,
        worstSetup: dnaData.worstSetup || null,
        worstSession: dnaData.worstSession || null,
        totalTradesAnalyzed: dnaData.totalTradesAnalyzed || trades.length,
        analysisPeriod: dnaData.analysisPeriod || null,
        aiSummary: dnaData.aiSummary || null,
      },
      create: {
        traderId: trader.id,
        tradingStyle: dnaData.tradingStyle || null,
        dominantEmotion: dnaData.dominantEmotion || null,
        strengths: dnaData.strengths ? JSON.stringify(dnaData.strengths) : null,
        weaknesses: dnaData.weaknesses ? JSON.stringify(dnaData.weaknesses) : null,
        bestSetup: dnaData.bestSetup || null,
        bestSession: dnaData.bestSession || null,
        bestRiskReward: dnaData.bestRiskReward || null,
        bestPair: dnaData.bestPair || null,
        worstSetup: dnaData.worstSetup || null,
        worstSession: dnaData.worstSession || null,
        totalTradesAnalyzed: dnaData.totalTradesAnalyzed || trades.length,
        analysisPeriod: dnaData.analysisPeriod || null,
        aiSummary: dnaData.aiSummary || null,
      },
    })

    return NextResponse.json({ dna })
  } catch (error) {
    console.error('Trading DNA POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Trading DNA' },
      { status: 500 }
    )
  }
}
