import { NextResponse } from 'next/server'

// GET /api/debug — Diagnose Vercel environment
export async function GET() {
  const info: Record<string, string | boolean | null> = {}

  // 1. Z.ai config
  info.zai_base_url = process.env.ZAI_BASE_URL || null
  info.zai_api_key = process.env.ZAI_API_KEY ? '***SET***' : '***MISSING***'
  info.zai_chat_id = process.env.ZAI_CHAT_ID ? '***SET***' : null
  info.zai_user_id = process.env.ZAI_USER_ID ? '***SET***' : null
  info.zai_token = process.env.ZAI_TOKEN ? '***SET***' : null

  // 2. Database
  info.database_url_prefix = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 25) + '...'
    : '***MISSING***'

  // 3. Supabase
  info.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || null
  info.supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : '***MISSING***'

  // 4. Test Z.ai API
  try {
    const baseUrl = process.env.ZAI_BASE_URL
    const apiKey = process.env.ZAI_API_KEY
    if (baseUrl && apiKey) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'X-Z-AI-From': 'Z',
          ...(process.env.ZAI_CHAT_ID ? { 'X-Chat-Id': process.env.ZAI_CHAT_ID } : {}),
          ...(process.env.ZAI_USER_ID ? { 'X-User-Id': process.env.ZAI_USER_ID } : {}),
          ...(process.env.ZAI_TOKEN ? { 'X-Token': process.env.ZAI_TOKEN } : {}),
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Reply with only: OK' },
            { role: 'user', content: 'test' },
          ],
          thinking: { type: 'disabled' },
        }),
      })

      info.zai_api_status = `${response.status} ${response.statusText}`
      if (response.ok) {
        const data = await response.json()
        info.zai_api_response = data.choices?.[0]?.message?.content?.substring(0, 50) || 'empty'
      } else {
        info.zai_api_response = await response.text().catch(() => 'no body')
      }
    } else {
      info.zai_api_status = 'SKIPPED (no config)'
    }
  } catch (err: unknown) {
    info.zai_api_error = err instanceof Error ? err.message : String(err)
  }

  // 5. Test Database
  try {
    const { db } = await import('@/lib/db')
    const trader = await db.trader.findFirst()
    info.db_status = 'OK'
    info.db_trader_found = trader ? 'YES' : 'NO'
    if (trader) {
      info.db_trader_name = trader.name
      info.db_trader_email = trader.email
    }
    const tradeCount = await db.tradeEntry.count()
    info.db_trade_count = String(tradeCount)
    const scoreCount = await db.processScoreSnapshot.count()
    info.db_score_count = String(scoreCount)
  } catch (err: unknown) {
    info.db_status = 'ERROR'
    info.db_error = err instanceof Error ? err.message : String(err)
  }

  // 6. Platform info
  info.platform = process.env.VERCEL ? 'Vercel' : process.env.NODE_ENV || 'Unknown'
  info.region = process.env.VERCEL_REGION || 'N/A'
  info.node_env = process.env.NODE_ENV || 'N/A'

  return NextResponse.json(info)
}
