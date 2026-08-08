/**
 * AI Chat Completion helper.
 *
 * Uses Google AI Studio (Gemini API) — free, publicly accessible, works on Vercel.
 *
 * Required env var:
 *   GEMINI_API_KEY — Get yours at https://aistudio.google.com/apikey
 *
 * Optional env vars:
 *   GEMINI_MODEL — Model name (default: "gemini-2.0-flash")
 */

const DEFAULT_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Call Google Gemini chat completions API.
 * Returns the AI response text.
 *
 * @param messages - Array of { role, content } objects.
 *   Supports "system" / "user" / "assistant" roles.
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and add it to your env vars.'
    )
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`

  // Gemini API format:
  // - "system" role → systemInstruction field
  // - "user"/"assistant" → contents array
  let systemInstruction: string | undefined
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = msg.content
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }
  }

  const body: Record<string, unknown> = { contents }
  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    }
  }

  // Generation config
  body.generationConfig = {
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(
      `Gemini API error ${response.status}: ${errorBody}`
    )
  }

  const data = await response.json()

  // Extract text from Gemini response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    const blockReason = data?.candidates?.[0]?.finishReason
    if (blockReason && blockReason !== 'STOP') {
      throw new Error(`Gemini blocked response: ${blockReason}`)
    }
    throw new Error('Gemini returned empty response')
  }

  return text
}
