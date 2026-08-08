/**
 * Z.ai LLM API helper using z-ai-web-dev-sdk.
 *
 * Strategy:
 * 1. On Vercel: read config from ENV variables (ZAI_BASE_URL, ZAI_API_KEY, etc.)
 * 2. On local: fallback to .z-ai-config file via SDK's ZAI.create()
 *
 * Import is lazy to avoid Turbopack build-time issues.
 */

let zaiInstance: InstanceType<Awaited<ReturnType<typeof import('z-ai-web-dev-sdk').default.create>>['constructor']> | null = null

async function getZAI() {
  if (!zaiInstance) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default

    // Check if env variables are set (Vercel deployment)
    const baseUrl = process.env.ZAI_BASE_URL
    const apiKey = process.env.ZAI_API_KEY

    if (baseUrl && apiKey) {
      // Vercel path: construct ZAI directly from env vars
      zaiInstance = new ZAI({
        baseUrl,
        apiKey,
        chatId: process.env.ZAI_CHAT_ID,
        userId: process.env.ZAI_USER_ID,
        token: process.env.ZAI_TOKEN,
      })
    } else {
      // Local dev path: SDK reads .z-ai-config from project root / home / /etc
      zaiInstance = await ZAI.create()
    }
  }
  return zaiInstance
}

/**
 * Call the Z.ai chat completions API via the SDK.
 * Returns the AI response text.
 */
export async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  const zai = await getZAI()

  const completion = await zai.chat.completions.create({
    messages: messages as Array<{ role: 'assistant' | 'user'; content: string }>,
    thinking: { type: 'disabled' },
  })

  return completion.choices?.[0]?.message?.content || ''
}
