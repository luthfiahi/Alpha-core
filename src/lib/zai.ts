import fs from 'fs/promises'
import path from 'path'
import ZAI from 'z-ai-web-dev-sdk'

/**
 * Ensures the .z-ai-config file exists in the working directory.
 *
 * The z-ai-web-dev-sdk reads its configuration from a .z-ai-config file.
 * On the Z.ai sandbox, this file exists at /etc/.z-ai-config.
 * On Vercel (production), it doesn't exist — so we create it from
 * environment variables or fallback defaults.
 */
let ensured = false

async function ensureZAIConfig(): Promise<void> {
  if (ensured) return

  const configPath = path.join(process.cwd(), '.z-ai-config')

  try {
    await fs.access(configPath)
    ensured = true
    return
  } catch {
    // File doesn't exist — create it
  }

  // Priority 1: Environment variables
  const baseUrl = process.env.ZAI_BASE_URL
  const apiKey = process.env.ZAI_API_KEY

  if (baseUrl && apiKey) {
    const config: Record<string, string> = { baseUrl, apiKey }
    if (process.env.ZAI_CHAT_ID) config.chatId = process.env.ZAI_CHAT_ID
    if (process.env.ZAI_USER_ID) config.userId = process.env.ZAI_USER_ID
    if (process.env.ZAI_TOKEN) config.token = process.env.ZAI_TOKEN

    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2))
      ensured = true
    } catch (writeErr) {
      console.error('Failed to write .z-ai-config:', writeErr)
    }
    return
  }

  // Priority 2: Fallback defaults (Z.ai platform credentials)
  // These are platform-level credentials, not user secrets.
  const defaultConfig = {
    baseUrl: 'https://internal-api.z.ai/v1',
    apiKey: 'Z.ai',
    chatId: process.env.ZAI_CHAT_ID || '',
    userId: process.env.ZAI_USER_ID || '',
    token: process.env.ZAI_TOKEN || '',
  }

  try {
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2))
    ensured = true
  } catch (writeErr) {
    console.error('Failed to write .z-ai-config (fallback):', writeErr)
  }
}

/**
 * Creates a ZAI SDK instance with config auto-provisioned.
 *
 * Use this instead of `ZAI.create()` in all API routes.
 * It ensures the .z-ai-config file exists (via env vars on Vercel)
 * before the SDK tries to read it.
 */
export async function createZAI() {
  await ensureZAIConfig()
  return ZAI.create()
}

export { ensureZAIConfig }
