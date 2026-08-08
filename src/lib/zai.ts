/**
 * AI Chat Completion helper.
 *
 * Uses OpenRouter API — free models, works on Vercel.
 * OpenAI-compatible API format.
 *
 * Required env var:
 *   OPENROUTER_API_KEY — Get yours at https://openrouter.ai/keys
 *
 * Optional env vars:
 *   AI_MODEL — Model name (default: "google/gemini-2.0-flash-exp:free")
 */

const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/**
 * Call OpenRouter chat completions API.
 * Returns the AI response text.
 *
 * @param messages - Array of { role, content } objects.
 *   Supports "system" / "user" / "assistant" roles.
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Get a free key at https://openrouter.ai/keys'
    )
  }

  const model = process.env.AI_MODEL || DEFAULT_MODEL
  const url = `${OPENROUTER_BASE_URL}/chat/completions`

  const response = await fetch(url, {
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
    throw new Error(
      `OpenRouter API error ${response.status}: ${errorBody}`
    )
  }

  const data = await response.json()

  const text = data?.choices?.[0]?.message?.content
  if (!text) {
    throw new Error('OpenRouter returned empty response')
  }

  return text
}
