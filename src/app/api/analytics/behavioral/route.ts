import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/analytics/behavioral?type=FOMO&severity=HIGH&resolved=false
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved')
    const limit = parseInt(searchParams.get('limit') || '50')

    let trader = await db.trader.findFirst()
    if (!trader) {
      trader = await db.trader.create({
        data: { email: 'trader@alpha.local', name: 'Luthfi' },
      })
    }

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
