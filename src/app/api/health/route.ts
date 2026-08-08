import { NextResponse } from 'next/server'

/**
 * GET /api/health — Ultra minimal health check.
 */
export async function GET() {
  try {
    const envCheck: Record<string, string> = {}
    envCheck.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING'
    envCheck.AI_MODEL = process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free (default)'
    envCheck.DATABASE_URL = process.env.DATABASE_URL ? 'SET' : 'MISSING'
    envCheck.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'
    envCheck.NODE_ENV = process.env.NODE_ENV || 'unknown'

    return NextResponse.json({
      status: 'ok',
      env: envCheck,
      ai_provider: 'OpenRouter',
      time: new Date().toISOString(),
    })
  } catch (err: unknown) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
