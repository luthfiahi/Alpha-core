/**
 * Z.ai LLM API helper.
 *
 * Does NOT depend on z-ai-web-dev-sdk at runtime.
 * Makes direct fetch calls using the exact same headers/body as the SDK.
 * Config comes from env variables (Vercel) or .z-ai-config file (local).
 */

interface ZAIConfig {
  baseUrl: string
  apiKey: string
  chatId?: string
  userId?: string
  token?: string
}

let cachedConfig: ZAIConfig | null = null

async function loadConfig(): Promise<ZAIConfig> {
  if (cachedConfig) return cachedConfig

  // 1. Try env variables first (Vercel / production)
  const envBaseUrl = process.env.ZAI_BASE_URL
  const envApiKey = process.env.ZAI_API_KEY

  if (envBaseUrl && envApiKey) {
    cachedConfig = {
      baseUrl: envBaseUrl,
      apiKey: envApiKey,
      chatId: process.env.ZAI_CHAT_ID || undefined,
      userId: process.env.ZAI_USER_ID || undefined,
      token: process.env.ZAI_TOKEN || undefined,
    }
    return cachedConfig
  }

  // 2. Fallback: read .z-ai-config file (local dev)
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const os = await import('os')

    const configPaths = [
      path.join(process.cwd(), '.z-ai-config'),
      path.join(os.homedir(), '.z-ai-config'),
      '/etc/.z-ai-config',
    ]

    for (const filePath of configPaths) {
      try {
        const raw = await fs.readFile(filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        if (parsed.baseUrl && parsed.apiKey) {
          cachedConfig = {
            baseUrl: parsed.baseUrl,
            apiKey: parsed.apiKey,
            chatId: parsed.chatId,
            userId: parsed.userId,
            token: parsed.token,
          }
          return cachedConfig
        }
      } catch {
        // File not found or invalid, try next
      }
    }
  } catch {
    // fs not available (unlikely in Node.js)
  }

  throw new Error(
    'Z.ai config not found. Set ZAI_BASE_URL + ZAI_API_KEY env variables, or create .z-ai-config file.'
  )
}

/**
 * Call the Z.ai chat completions API.
 * Returns the AI response text.
 */
export async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  const config = await loadConfig()
  const url = `${config.baseUrl}/chat/completions`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
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
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Z.ai API ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
