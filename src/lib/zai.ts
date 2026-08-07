/**
 * Direct Z.ai LLM API helper — no SDK dependency.
 *
 * The z-ai-web-dev-sdk requires a .z-ai-config file which doesn't exist
 * on Vercel. This helper calls the API directly via fetch.
 */

interface ChatCompletionResponse {
  choices?: Array<{
    finish_reason?: string
    message?: { content?: string; role?: string }
  }>
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

function getConfig() {
  return {
    baseUrl: process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1',
    apiKey: process.env.ZAI_API_KEY || 'Z.ai',
    chatId: process.env.ZAI_CHAT_ID || undefined,
    userId: process.env.ZAI_USER_ID || undefined,
    token: process.env.ZAI_TOKEN || undefined,
  }
}

/**
 * Call the Z.ai chat completions API directly.
 * Uses the same interface as z-ai-web-dev-sdk for easy migration.
 */
export async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  const config = getConfig()
  const url = `${config.baseUrl}/chat/completions`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'X-Z-AI-From': 'Z',
  }
  if (config.chatId) headers['X-Chat-Id'] = config.chatId
  if (config.userId) headers['X-User-Id'] = config.userId
  if (config.token) headers['X-Token'] = config.token

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      thinking: { type: 'disabled' },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`AI API error ${response.status}: ${errorText}`)
  }

  const data: ChatCompletionResponse = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
