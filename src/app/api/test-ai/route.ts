import { NextResponse } from 'next/server'

/**
 * GET /api/test-ai — Tests AI API connection.
 * Returns diagnostic info even on failure.
 */
export async function GET() {
  const baseUrl = process.env.ZAI_BASE_URL
  const apiKey = process.env.ZAI_API_KEY

  if (!baseUrl || !apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'ZAI_BASE_URL or ZAI_API_KEY env not set in Vercel',
      hint: 'Add these in Vercel Settings > Environment Variables',
    })
  }

  try {
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
          { role: 'assistant', content: 'Reply OK' },
          { role: 'user', content: 'test' },
        ],
        thinking: { type: 'disabled' },
      }),
    })
    const elapsed = Date.now() - startTime

    if (!response.ok) {
      const body = await response.text().catch(() => 'unreadable')
      return NextResponse.json({
        status: 'error',
        httpStatus: response.status,
        body: body.slice(0, 500),
        elapsed: `${elapsed}ms`,
        explanation: `The AI API (${baseUrl}) returned HTTP ${response.status}. This URL may not be reachable from Vercel's network.`,
      })
    }

    const data = await response.json()
    return NextResponse.json({
      status: 'ok',
      response: data.choices?.[0]?.message?.content || 'EMPTY',
      elapsed: `${elapsed}ms`,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      message: msg,
      explanation: `"fetch failed" means ${baseUrl} is NOT reachable from Vercel. This is an internal Z.ai API URL that only works inside the Z.ai sandbox environment. For Vercel production, you need a publicly accessible AI API.`,
      env: {
        ZAI_BASE_URL: baseUrl,
        ZAI_API_KEY: apiKey ? '(set)' : 'NOT SET',
      },
    })
  }
}
