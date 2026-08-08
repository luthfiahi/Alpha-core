import { NextResponse } from 'next/server'

/**
 * GET /api/debug-ai — Diagnose AI Coach connection.
 * Uses Google Gemini API.
 */
export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Check env variables
  results.env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET ✓' : 'MISSING ✗',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash (default)',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET ✓ (len=' + process.env.DATABASE_URL.length + ')' : 'MISSING ✗',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✓' : 'MISSING ✗',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✓' : 'MISSING ✗',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    ai_provider: 'Google Gemini (AI Studio)',
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

  // 3. Test Gemini API call
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: 'Balas dengan kata: OK' }] },
          ],
          generationConfig: { maxOutputTokens: 32 },
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
        results.apiTest.content = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'EMPTY'
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
    results.apiTest = { skipped: true, reason: 'GEMINI_API_KEY not set' }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
