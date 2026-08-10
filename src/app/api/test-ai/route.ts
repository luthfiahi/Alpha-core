import { NextResponse } from 'next/server'

function productionNotFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * GET /api/test-ai — Development-only OpenRouter connection check.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return productionNotFound()
  }

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { status: 'error', message: 'OPENROUTER_API_KEY not set' },
      { status: 503 },
    )
  }

  const model = process.env.AI_MODEL || 'poolside/laguna-s-2.1:free'

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
      return NextResponse.json(
        {
          status: 'error',
          httpStatus: response.status,
          elapsed: `${elapsed}ms`,
          model,
        },
        { status: 502 },
      )
    }

    const data = await response.json()
    const responseText = data?.choices?.[0]?.message?.content || 'EMPTY'

    return NextResponse.json({
      status: 'ok',
      model,
      response: responseText,
      elapsed: `${elapsed}ms`,
    })
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'AI connection failed', model },
      { status: 500 },
    )
  }
}
