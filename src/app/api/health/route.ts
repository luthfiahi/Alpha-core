import { NextResponse } from 'next/server'

/**
 * GET /api/health — Ultra minimal health check.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
