import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import { requireTrader } from '@/lib/api-auth'

// GET /api/analytics/weekly-review — list all weekly reviews
export async function GET() {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    const reviews = await db.weeklyReviewRecord.findMany({
      where: { traderId: trader.id },
      orderBy: { weekStart: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('[GET /api/analytics/weekly-review] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil daftar review mingguan' },
      { status: 500 }
    )
  }
}

// POST /api/analytics/weekly-review — generate new weekly review via AI
export async function POST(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    // Get current week's trades
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    const trades = await db.tradeEntry.findMany({
      where: {
        traderId: trader.id,
        createdAt: { gte: weekStart, lte: weekEnd },
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    })

    const behavioralEvents = await db.behavioralEvent.findMany({
      where: {
        traderId: trader.id,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { createdAt: 'desc' },
    })

    const closedTrades = trades.filter(t => t.status === 'CLOSED')
    const winningTrades = closedTrades.filter(t => t.profitLoss > 0)
    const winRate = closedTrades.length > 0
      ? Math.round((winningTrades.length / closedTrades.length) * 100)
      : 0
    const totalPnL = closedTrades.reduce((sum, t) => sum + t.profitLoss, 0)

    // Check for existing review this week
    const existingReview = await db.weeklyReviewRecord.findFirst({
      where: {
        traderId: trader.id,
        weekStart: weekStartStr,
      },
    })

    if (existingReview) {
      return NextResponse.json({ review: existingReview, message: 'Review minggu ini sudah ada.' })
    }

    // Build context for AI
    const tradeSummaries = trades.map(t =>
      `- ${t.pair} ${t.direction} | Entry: ${t.entryPrice} | SL: ${t.stopLoss ?? '-'} | TP: ${t.takeProfit ?? '-'} | P/L: $${t.profitLoss} | Emosi: ${t.emotionBefore ?? '-'} → ${t.emotionAfter ?? '-'} | Behavioral: ${t.behavioralTags ?? 'none'}`
    ).join('\n')

    const behaviorSummary = behavioralEvents.map(be =>
      `- ${be.behaviorType} (${be.severity}): ${be.aiAnalysis}`
    ).join('\n')

    const prompt = `Buatkan review mingguan trading dalam Bahasa Indonesia. Data minggu ini:

Total Trade: ${trades.length}
Closed Trades: ${closedTrades.length}
Win Rate: ${winRate}%
Total P/L: $${Math.round(totalPnL * 100) / 100}

Detail Trade:
${tradeSummaries || 'Tidak ada trade minggu ini'}

Behavioral Events:
${behaviorSummary || 'Tidak ada behavioral event'}

Berikan output dalam format JSON (tanpa markdown code block):
{
  "summary": "ringkasan 2-3 kalimat",
  "biggestMistake": "kesalahan terbesar atau null jika tidak ada",
  "recommendation": "rekomendasi untuk minggu depan",
  "topBehavioralIssue": "REVENGE_TRADING/FOMO/OVERCONFIDENCE/FEAR/MOVING_STOP_LOSS/EARLY_CLOSE atau null",
  "processScore": (angka 0-100),
  "ruleCompliance": (angka 0-100),
  "playbookUsage": (angka 0-100),
  "emotionBreakdown": { "calm": (angka), "anxious": (angka), "confident": (angka), "fearful": (angka) }
}`

    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten AI yang membuat review mingguan trading. Output hanya JSON valid, tanpa penjelasan tambahan. Bahasa Indonesia.',
        },
        { role: 'user', content: prompt },
      ],
    })

    // Parse AI response
    let aiData: Record<string, unknown> = {}
    const rawContent = (response as unknown as { content?: string; choices?: Array<{ message?: { content?: string } }> }).content
      || (response as unknown as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content
      || '{}'

    try {
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiData = JSON.parse(cleaned)
    } catch {
      console.warn('Failed to parse AI response, using fallback data')
      aiData = {
        summary: 'Review otomatis: Trading minggu ini menunjukkan konsistensi yang perlu ditingkatkan.',
        biggestMistake: null,
        recommendation: 'Fokus pada proses dan disiplin minggu depan.',
        topBehavioralIssue: null,
        processScore: 50,
        ruleCompliance: 50,
        playbookUsage: 50,
        emotionBreakdown: { calm: 50, anxious: 25, confident: 20, fearful: 5 },
      }
    }

    const emotionBreakdown = aiData.emotionBreakdown
      ? JSON.stringify(aiData.emotionBreakdown)
      : JSON.stringify({ calm: 50, anxious: 25, confident: 20, fearful: 5 })

    // Save to database
    const review = await db.weeklyReviewRecord.create({
      data: {
        traderId: trader.id,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        summary: (aiData.summary as string) || 'Review minggu ini belum tersedia.',
        processScore: typeof aiData.processScore === 'number' ? Math.min(100, Math.max(0, Math.round(aiData.processScore))) : 50,
        ruleCompliance: typeof aiData.ruleCompliance === 'number' ? Math.min(100, Math.max(0, aiData.ruleCompliance)) : 50,
        totalTrades: closedTrades.length,
        winRate,
        totalPnL: Math.round(totalPnL * 100) / 100,
        biggestMistake: aiData.biggestMistake as string | null || null,
        recommendation: aiData.recommendation as string | null || null,
        topBehavioralIssue: aiData.topBehavioralIssue as string | null || null,
        playbookUsage: typeof aiData.playbookUsage === 'number' ? Math.min(100, Math.max(0, aiData.playbookUsage)) : 50,
        emotionBreakdown,
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('[POST /api/analytics/weekly-review] Error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat review mingguan' },
      { status: 500 }
    )
  }
}
