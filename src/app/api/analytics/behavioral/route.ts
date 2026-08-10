import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTrader } from '@/lib/api-auth'

// GET /api/analytics/behavioral?type=FOMO&severity=HIGH&resolved=false
export async function GET(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: 'Trader not found' }, { status: 404 })

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

    const where: Record<string, unknown> = {
      traderId: trader.id,
    }

    if (type) where.behaviorType = type
    if (severity) where.severity = severity
    if (resolved !== null && resolved !== undefined && resolved !== '') {
      where.resolved = resolved === 'true'
    }

    const events = await db.behavioralEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get distribution counts
    const distribution = await db.behavioralEvent.groupBy({
      by: ['behaviorType'],
      where: { traderId: trader.id },
      _count: { id: true },
    })

    // Severity distribution
    const severityDistribution = await db.behavioralEvent.groupBy({
      by: ['severity'],
      where: { traderId: trader.id },
      _count: { id: true },
    })

    // Unresolved count
    const unresolvedCount = await db.behavioralEvent.count({
      where: { traderId: trader.id, resolved: false },
    })

    return NextResponse.json({
      events,
      distribution,
      severityDistribution,
      unresolvedCount,
    })
  } catch (error) {
    console.error('[GET /api/analytics/behavioral] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data behavioral' },
      { status: 500 }
    )
  }
}
