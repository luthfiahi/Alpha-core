import { NextRequest, NextResponse } from 'next/server'
import { updateL2Digest } from '@/lib/ai/memory/l2-updater'

// POST /api/memory/l2-update — Triggers L2 digest regeneration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const traderId = (body as { traderId?: string }).traderId

    const digest = await updateL2Digest(traderId)

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
