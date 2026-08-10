import { NextRequest, NextResponse } from 'next/server'
import { updateL2Digest } from '@/lib/ai/memory/l2-updater'
import { requireTrader } from '@/lib/api-auth'

// POST /api/memory/l2-update — Triggers L2 digest regeneration
export async function POST(request: NextRequest) {
  try {
    const { trader, error: authError } = await requireTrader()
    if (authError) return authError
    if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

    await request.json().catch(() => ({}))
    const digest = await updateL2Digest(trader.id)

    return NextResponse.json({
      success: true,
      digest,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('POST /api/memory/l2-update error:', error)
    return NextResponse.json(
      { error: 'Failed to update L2 digest' },
      { status: 500 }
    )
  }
}
