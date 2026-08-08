import { NextResponse } from 'next/server'

// GET /api/test-coach — Minimal AI Coach test, no database needed
export async function GET() {
  try {
    const { chatCompletion } = await import('@/lib/zai')

    const response = await chatCompletion([
      { role: 'assistant', content: 'You are Alpha, an AI Trading Coach. Reply in Indonesian. Keep it to 2 sentences.' },
      { role: 'user', content: 'Halo Alpha!' },
    ])

    return NextResponse.json({
      status: 'ok',
      ai_response: response,
      env_zai_base_url: process.env.ZAI_BASE_URL ? 'SET' : 'MISSING',
      env_zai_api_key: process.env.ZAI_API_KEY ? 'SET' : 'MISSING',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      error: msg,
      env_zai_base_url: process.env.ZAI_BASE_URL ? 'SET' : 'MISSING',
      env_zai_api_key: process.env.ZAI_API_KEY ? 'SET' : 'MISSING',
    }, { status: 500 })
  }
}
