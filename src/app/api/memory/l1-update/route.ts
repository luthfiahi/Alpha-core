import { NextRequest, NextResponse } from 'next/server'
import { updateL1Summary } from '@/lib/ai/memory/l1-updater'
import { getAuthUser } from '@/lib/api-auth'

// POST /api/memory/l1-update — Triggers L1 summary regeneration
export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await getAuthUser()
    if (authError) return authError

    const body = await request.json().catch(() => ({}))
    const traderId = (body as { traderId?: string }).traderId

    const summary = await updateL1Summary(traderId)

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
