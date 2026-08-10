import { NextResponse } from 'next/server'

function productionNotFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * GET /api/test-db — Development-only database connection check.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return productionNotFound()
  }

  try {
    const { db } = await import('@/lib/db')
    const traderCount = await db.trader.count()
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      traderCount,
    })
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        source: 'database',
        message: 'Database connection failed',
      },
      { status: 500 },
    )
  }
}
