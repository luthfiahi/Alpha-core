import { NextResponse } from 'next/server'

function productionNotFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// GET /api/test-coach — Development-only AI Coach connection check.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return productionNotFound()
  }

  try {
    const { chatCompletion } = await import('@/lib/zai')

    const response = await chatCompletion([
      {
        role: 'system',
        content:
          'You are Alpha, an AI Trading Coach. Reply in Indonesian. Keep it to 2 sentences.',
      },
      { role: 'user', content: 'Halo Alpha!' },
    ])

    return NextResponse.json({
      status: 'ok',
      ai_response: response,
      model: process.env.AI_MODEL || 'default',
    })
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'AI Coach connection failed' },
      { status: 500 },
    )
  }
}
