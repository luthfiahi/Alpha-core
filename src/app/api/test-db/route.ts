import { NextResponse } from 'next/server'

/**
 * GET /api/test-db — Tests ONLY database connection.
 */
export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const traderCount = await db.trader.count()
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      traderCount,
    })
  } catch (err: unknown) {
    return NextResponse.json({
      status: 'error',
      source: 'database',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
