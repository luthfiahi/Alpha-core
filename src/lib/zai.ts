/**
 * Z.ai LLM API helper.
 *
 * Strategy (priority order):
 * 1. If ZAI_PROXY_URL is set → call the local AI proxy mini-service
 * 2. If ZAI_BASE_URL + ZAI_API_KEY env vars are set → call API directly
 * 3. Fallback: read .z-ai-config file and call API directly
 *
 * The proxy is used in the Z.ai sandbox (where internal API is only accessible locally).
 * Direct calls are used when the API is publicly reachable.
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

  // 1. Try env variables
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

  // 2. Fallback: read .z-ai-config file
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
        // Not found, try next
      }
    }
  } catch {
    // fs not available
  }

  throw new Error(
    'Z.ai config not found. Set ZAI_BASE_URL + ZAI_API_KEY, or create .z-ai-config.'
  )
}

/**
 * Call the Z.ai chat completions API.
 * Returns the AI response text.
 */
export async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  // Check if proxy URL is available (sandbox environment)
  const proxyUrl = process.env.ZAI_PROXY_URL

  if (proxyUrl) {
    // Use the AI proxy mini-service
    const response = await fetch(`${proxyUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(`AI Proxy error ${response.status}: ${errorBody}`)
    }

    const data = await response.json()
    return data.content || ''
  }

  // Direct API call
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
