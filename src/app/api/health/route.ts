import { NextResponse } from 'next/server'

/**
 * GET /api/health — Ultra minimal health check.
 * Does NOT import db, zai, or any local modules.
 * Only checks env variables.
 */
export async function GET() {
  try {
    const envCheck: Record<string, string> = {}
    envCheck.ZAI_BASE_URL = process.env.ZAI_BASE_URL ? 'SET' : 'MISSING'
    envCheck.ZAI_API_KEY = process.env.ZAI_API_KEY ? 'SET' : 'MISSING'
    envCheck.DATABASE_URL = process.env.DATABASE_URL ? 'SET' : 'MISSING'
    envCheck.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'
    envCheck.NODE_ENV = process.env.NODE_ENV || 'unknown'

    return NextResponse.json({
      status: 'ok',
      env: envCheck,
      time: new Date().toISOString(),
    })
  } catch (err: unknown) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
