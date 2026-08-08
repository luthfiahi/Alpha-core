import { NextResponse } from 'next/server'

/**
 * GET /api/test-ai — Tests Gemini API connection.
 * Returns diagnostic info even on failure.
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'GEMINI_API_KEY not set',
      hint: 'Get a free key at https://aistudio.google.com/apikey and add it in Vercel Settings > Environment Variables',
    })
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Balas dengan kata OK' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 32,
        },
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
        explanation: `Gemini API (${model}) returned HTTP ${response.status}. Check your API key.`,
      })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'EMPTY'

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
