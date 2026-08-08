import { NextResponse } from 'next/server'

// GET /api/test-coach — Minimal AI Coach test via OpenRouter
export async function GET() {
  try {
    const { chatCompletion } = await import('@/lib/zai')

    const response = await chatCompletion([
      { role: 'system', content: 'You are Alpha, an AI Trading Coach. Reply in Indonesian. Keep it to 2 sentences.' },
      { role: 'user', content: 'Halo Alpha!' },
    ])

    return NextResponse.json({
      status: 'ok',
      ai_response: response,
      env_openrouter_api_key: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
      env_ai_model: process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free (default)',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      error: msg,
      env_openrouter_api_key: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
    }, { status: 500 })
  }
}
