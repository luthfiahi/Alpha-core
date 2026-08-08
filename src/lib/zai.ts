/**
 * Z.ai LLM API helper using z-ai-web-dev-sdk.
 *
 * The SDK reads .z-ai-config from: project root > home dir > /etc.
 * On Vercel, the file is in the project root (committed to git).
 * Import is lazy to avoid Turbopack build-time issues.
 */

let zaiInstance: Awaited<ReturnType<typeof import('z-ai-web-dev-sdk').default.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    zaiInstance = await ZAI.create()
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
