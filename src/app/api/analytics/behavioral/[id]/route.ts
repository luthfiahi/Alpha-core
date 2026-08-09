import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/api-auth'

// PUT /api/analytics/behavioral/:id — resolve a behavioral event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error: authError } = await getAuthUser()
    if (authError) return authError

    const event = await db.behavioralEvent.findUnique({
      where: { id },
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
