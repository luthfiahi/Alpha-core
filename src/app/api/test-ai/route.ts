import { NextResponse } from 'next/server'

/**
 * GET /api/test-ai — Tests OpenRouter API connection.
 */
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'OPENROUTER_API_KEY not set',
      hint: 'Get a free key at https://openrouter.ai/keys and add it in Vercel Settings > Environment Variables',
    })
  }

  const model = process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free'

  try {
    const startTime = Date.now()
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://alpha-core-ten.vercel.app',
        'X-Title': 'Alpha - Test',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Balas dengan kata: OK' }],
        max_tokens: 32,
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
        model,
      })
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content || 'EMPTY'

    return NextResponse.json({
      status: 'ok',
      model,
      response: text,
      elapsed: `${elapsed}ms`,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      message: msg,
      model,
    })
  }
}
