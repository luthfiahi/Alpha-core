import { NextResponse } from 'next/server'

// GET /api/test-coach — Minimal AI Coach test via Gemini
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
      env_gemini_api_key: process.env.GEMINI_API_KEY ? 'SET' : 'MISSING',
      env_gemini_model: process.env.GEMINI_MODEL || 'gemini-2.0-flash (default)',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      error: msg,
      env_gemini_api_key: process.env.GEMINI_API_KEY ? 'SET' : 'MISSING',
    }, { status: 500 })
  }
}
