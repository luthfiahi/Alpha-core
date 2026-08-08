/**
 * AI Proxy Mini-Service
 * 
 * Runs within the Z.ai sandbox and proxies AI requests to the internal API.
 * The Next.js app calls this service instead of the internal API directly.
 * This allows AI features to work both locally and through the sandbox gateway.
 */

import ZAI from 'z-ai-web-dev-sdk'

const PORT = 3003

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    // Health check
    if (req.method === 'GET' && new URL(req.url).pathname === '/health') {
      return Response.json({ status: 'ok', service: 'ai-proxy', port: PORT })
    }

    // Main AI proxy endpoint
    if (req.method === 'POST' && new URL(req.url).pathname === '/chat') {
      try {
        const body = await req.json()
        const { messages } = body

        if (!messages || !Array.isArray(messages)) {
          return Response.json({ error: 'messages array is required' }, { status: 400 })
        }

        const zai = await getZAI()
        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: 'disabled' },
        })

        const content = completion.choices?.[0]?.message?.content || ''
        return Response.json({ content })
      } catch (err: unknown) {
        console.error('AI Proxy error:', err)
        return Response.json(
          { error: err instanceof Error ? err.message : String(err) },
          { status: 500 }
        )
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404 })
  },
})

console.log(`🤖 AI Proxy running on port ${PORT}`)
