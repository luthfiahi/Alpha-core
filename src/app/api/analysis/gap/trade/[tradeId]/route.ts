import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTrader } from '@/lib/api-auth'

// ========================================
// GET Handler — Get all gaps for a specific trade
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> }
) {
  try {
    const { trader, error: authError } = await requireTrader()
    if (authError) return authError
    if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

    const { tradeId } = await params

    if (!tradeId) {
      return NextResponse.json(
        { error: 'tradeId is required' },
        { status: 400 }
      )
    }

    // Verify trade exists
    const trade = await db.tradeEntry.findFirst({
      where: { id: tradeId, traderId: trader.id },
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    const gaps = await db.reflectionGapRecord.findMany({
      where: { tradeId, traderId: trader.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ gaps, tradeId })
  } catch (error) {
    console.error('Trade gaps API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gaps for trade' },
      { status: 500 }
    )
  }
}
