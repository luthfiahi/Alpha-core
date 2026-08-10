import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTrader } from '@/lib/api-auth'

// PUT /api/analytics/behavioral/:id — resolve a behavioral event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { trader, error: authError } = await requireTrader()
    if (authError) return authError
    if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

    const event = await db.behavioralEvent.findFirst({
      where: { id, traderId: trader.id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event tidak ditemukan' },
        { status: 404 }
      )
    }

    const updated = await db.behavioralEvent.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    })

    return NextResponse.json({ event: updated })
  } catch (error) {
    console.error('[PUT /api/analytics/behavioral/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate event' },
      { status: 500 }
    )
  }
}
