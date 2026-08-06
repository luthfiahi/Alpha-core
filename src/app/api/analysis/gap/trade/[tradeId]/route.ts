import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ========================================
// GET Handler — Get all gaps for a specific trade
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> }
) {
  try {
    const { tradeId } = await params

    if (!tradeId) {
      return NextResponse.json(
        { error: 'tradeId is required' },
        { status: 400 }
      )
    }

    // Verify trade exists
    const trade = await db.tradeEntry.findUnique({
      where: { id: tradeId },
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    const gaps = await db.reflectionGapRecord.findMany({
      where: { tradeId },
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
