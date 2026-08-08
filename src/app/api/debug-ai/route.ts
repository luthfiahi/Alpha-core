import { NextResponse } from 'next/server'

/**
 * GET /api/debug-ai — Diagnose AI Coach connection issues.
 * Call this from browser to see exactly what's failing.
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
  }

  // 2. Check .z-ai-config file
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
    results.fileConfig = { found: false, path: '.z-ai-config in project root' }
  }

  // 3. Test actual API call
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
        hint: 'If this says "fetch failed", the API URL is not reachable from this server.',
      }
    }
  } else {
    results.apiTest = { skipped: 'No env variables set' }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
