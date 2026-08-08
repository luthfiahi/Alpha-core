import { NextResponse } from 'next/server'

/**
 * GET /api/test-ai — Tests ONLY AI API connection.
 * Does NOT import db or Prisma.
 */
export async function GET() {
  try {
    const baseUrl = process.env.ZAI_BASE_URL
    const apiKey = process.env.ZAI_API_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'ZAI_BASE_URL or ZAI_API_KEY not set',
      }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Z-AI-From': 'Z',
    }
    if (process.env.ZAI_CHAT_ID) headers['X-Chat-Id'] = process.env.ZAI_CHAT_ID
    if (process.env.ZAI_USER_ID) headers['X-User-Id'] = process.env.ZAI_USER_ID
    if (process.env.ZAI_TOKEN) headers['X-Token'] = process.env.ZAI_TOKEN

    const startTime = Date.now()
    const response = await fetch(`${baseUrl}/chat/completions`, {
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

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'unreadable')
      return NextResponse.json({
        status: 'error',
        source: 'ai_api',
        httpStatus: response.status,
        body: errorBody,
        elapsed: `${elapsed}ms`,
      }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json({
      status: 'ok',
      ai: 'connected',
      response: data.choices?.[0]?.message?.content || 'EMPTY',
      elapsed: `${elapsed}ms`,
    })
  } catch (err: unknown) {
    return NextResponse.json({
      status: 'error',
      source: 'ai_fetch',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
