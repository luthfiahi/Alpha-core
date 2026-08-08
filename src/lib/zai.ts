/**
 * AI Chat Completion helper.
 *
 * Priority order:
 *   1. Z.ai SDK (z-ai-web-dev-sdk) — works in sandbox, better quality
 *   2. OpenRouter API — fallback for Vercel production
 *
 * Required env var (fallback only):
 *   OPENROUTER_API_KEY — Get yours at https://openrouter.ai/keys
 *
 * Optional env vars:
 *   AI_MODEL — Model name for OpenRouter (default: "poolside/laguna-s-2.1:free")
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_DEFAULT_MODEL = 'poolside/laguna-s-2.1:free'

// Track if Z.ai SDK is available (checked once)
let zaiAvailable: boolean | null = null
let zaiInstance: Awaited<ReturnType<typeof import('z-ai-web-dev-sdk').default.create>> | null = null

/**
 * Try to initialize Z.ai SDK.
 * Returns true if SDK is available and working.
 */
async function tryInitZai(): Promise<boolean> {
  if (zaiAvailable !== null) return zaiAvailable

  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    zaiInstance = await ZAI.create()

    // Quick connectivity test
    const test = await zaiInstance.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'Reply with only: OK' },
        { role: 'user', content: 'Test' },
      ],
      thinking: { type: 'disabled' },
    })

    if (test?.choices?.[0]?.message?.content) {
      zaiAvailable = true
      console.log('[AI] ✅ Z.ai SDK connected')
      return true
    }

    zaiAvailable = false
    return false
  } catch (err) {
    console.warn('[AI] ⚠️ Z.ai SDK not available, falling back to OpenRouter:', (err as Error).message)
    zaiAvailable = false
    return false
  }
}

/**
 * Call Z.ai SDK directly (better quality, no external API needed).
 */
async function zaiChatCompletion(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!zaiInstance) throw new Error('Z.ai SDK not initialized')

  // Z.ai SDK uses 'assistant' role for system prompts
  const sdkMessages = messages.map((m) => ({
    role: (m.role === 'system' ? 'assistant' : m.role) as 'assistant' | 'user',
    content: m.content,
  }))

  const completion = await zaiInstance.chat.completions.create({
    messages: sdkMessages,
    thinking: { type: 'disabled' },
  })

  const text = completion?.choices?.[0]?.message?.content
  if (!text || text.trim().length === 0) {
    throw new Error('Z.ai returned empty response')
  }

  return text
}

/**
 * Call OpenRouter as fallback.
 */
async function openRouterChatCompletion(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'No AI provider available. Set OPENROUTER_API_KEY for OpenRouter fallback.'
    )
  }

  const model = process.env.AI_MODEL || OPENROUTER_DEFAULT_MODEL

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alpha-core-ten.vercel.app',
      'X-Title': 'Alpha - AI Trading Coach',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) {
    throw new Error('OpenRouter returned empty response')
  }

  return text
}

/**
 * Call AI chat completions.
 * Tries Z.ai SDK first, falls back to OpenRouter.
 *
 * @param messages - Array of { role, content } objects.
 *   Supports "system" / "user" / "assistant" roles.
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  // Try Z.ai SDK first
  const isZaiAvailable = await tryInitZai()
  if (isZaiAvailable && zaiInstance) {
    try {
      return await zaiChatCompletion(messages)
    } catch (err) {
      console.warn('[AI] Z.ai SDK call failed, falling back to OpenRouter:', (err as Error).message)
      // Fall through to OpenRouter
    }
  }

  // Fallback to OpenRouter
  return openRouterChatCompletion(messages)
}
