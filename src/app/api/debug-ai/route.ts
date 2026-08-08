import { NextResponse } from 'next/server'

/**
 * GET /api/debug-ai — Diagnose AI Coach and Supabase connection issues.
 */
export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Check env variables
  results.env = {
    ZAI_BASE_URL: process.env.ZAI_BASE_URL ? 'SET ✓' : 'MISSING ✗',
    ZAI_API_KEY: process.env.ZAI_API_KEY ? 'SET ✓' : 'MISSING ✗',
    ZAI_CHAT_ID: process.env.ZAI_CHAT_ID ? 'SET ✓' : 'NOT SET (optional)',
    ZAI_USER_ID: process.env.ZAI_USER_ID ? 'SET ✓' : 'NOT SET (optional)',
    ZAI_TOKEN: process.env.ZAI_TOKEN ? 'SET ✓ (len=' + process.env.ZAI_TOKEN.length + ')' : 'NOT SET (optional)',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET ✓ (len=' + process.env.DATABASE_URL.length + ')' : 'MISSING ✗',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✓' : 'MISSING ✗',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✓' : 'MISSING ✗',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
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

  // 3. Check .z-ai-config file
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const configPath = path.join(process.cwd(), '.z-ai-config')
    const raw = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(raw)
    results.fileConfig = {
      found: true,
      baseUrl: config.baseUrl || 'MISSING',
      hasApiKey: !!config.apiKey,
      path: configPath,
    }
  } catch {
    results.fileConfig = { found: false }
  }

  // 4. Test AI API call
  const baseUrl = process.env.ZAI_BASE_URL
  const apiKey = process.env.ZAI_API_KEY

  if (baseUrl && apiKey) {
    try {
      const url = `${baseUrl}/chat/completions`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-Z-AI-From': 'Z',
      }
      if (process.env.ZAI_CHAT_ID) headers['X-Chat-Id'] = process.env.ZAI_CHAT_ID
      if (process.env.ZAI_USER_ID) headers['X-User-Id'] = process.env.ZAI_USER_ID
      if (process.env.ZAI_TOKEN) headers['X-Token'] = process.env.ZAI_TOKEN

      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Reply with just: OK' },
            { role: 'user', content: 'test' },
          ],
          thinking: { type: 'disabled' },
        }),
      })
      const elapsed = Date.now() - startTime

      results.apiTest = {
        status: response.status,
        statusText: response.statusText,
        elapsed: `${elapsed}ms`,
        url,
      }

      if (response.ok) {
        const data = await response.json()
        results.apiTest.content = data.choices?.[0]?.message?.content || 'EMPTY'
      } else {
        results.apiTest.errorBody = await response.text().catch(() => 'unreadable')
      }
    } catch (err: unknown) {
      results.apiTest = {
        error: true,
        message: err instanceof Error ? err.message : String(err),
      }
    }
  } else {
    results.apiTest = { skipped: true, reason: 'ZAI_BASE_URL or ZAI_API_KEY not set' }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
