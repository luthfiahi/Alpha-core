import { NextRequest, NextResponse } from 'next/server'
import { updateL1Summary } from '@/lib/ai/memory/l1-updater'
import { requireTrader } from '@/lib/api-auth'

// POST /api/memory/l1-update — Triggers L1 summary regeneration
export async function POST(request: NextRequest) {
  try {
    const { trader, error: authError } = await requireTrader()
    if (authError) return authError
    if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

    await request.json().catch(() => ({}))
    const summary = await updateL1Summary(trader.id)

    return NextResponse.json({
      success: true,
      summary,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('POST /api/memory/l1-update error:', error)
    return NextResponse.json(
      { error: 'Failed to update L1 summary' },
      { status: 500 }
    )
  }
}
