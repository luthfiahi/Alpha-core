import { NextResponse } from 'next/server'

/**
 * GET /api/debug-ai — Diagnose AI Coach connection via OpenRouter.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const results: Record<string, unknown> = {}

  // 1. Check env variables
  results.env = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET ✓' : 'MISSING ✗',
    AI_MODEL: process.env.AI_MODEL || 'poolside/laguna-s-2.1:free (default)',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET ✓' : 'MISSING ✗',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✓' : 'MISSING ✗',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    ai_provider: 'OpenRouter',
  }

  // 2. Test database connection
  try {
    const { db } = await import('@/lib/db')
    const traderCount = await db.trader.count()
    results.database = { status: 'OK ✓', traderCount }
  } catch (err: unknown) {
    results.database = {
      status: 'FAILED ✗',
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // 3. Test OpenRouter API call
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.AI_MODEL || 'poolside/laguna-s-2.1:free'

  if (apiKey) {
    try {
      const startTime = Date.now()
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://alpha-core-ten.vercel.app',
          'X-Title': 'Alpha - Debug',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Balas dengan kata: OK' }],
          max_tokens: 32,
        }),
      })
      const elapsed = Date.now() - startTime

      results.apiTest = {
        status: response.status,
        statusText: response.statusText,
        elapsed: `${elapsed}ms`,
        model,
      }

      if (response.ok) {
        const data = await response.json()
        results.apiTest.content = data?.choices?.[0]?.message?.content || 'EMPTY'
      } else {
        results.apiTest.errorBody = (await response.text().catch(() => 'unreadable')).slice(0, 500)
      }
    } catch (err: unknown) {
      results.apiTest = {
        error: true,
        message: err instanceof Error ? err.message : String(err),
      }
    }
  } else {
    results.apiTest = { skipped: true, reason: 'OPENROUTER_API_KEY not set' }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
