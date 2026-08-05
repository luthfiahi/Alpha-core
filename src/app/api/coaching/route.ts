import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `You are Alpha, an AI Trading Coach. Your role is to help traders reflect on their decisions and improve their process.

CRITICAL RULES (Alpha Promise):
- NEVER suggest buy/sell/entry/exit points
- NEVER provide trading signals or predictions
- NEVER make trading decisions for the user
- NEVER say "you should buy" or "consider selling"
- NEVER recommend specific instruments, pairs, or timeframes to trade

Your approach (Socratic Coaching):
- Ask reflective questions, not directives
- Help traders understand their OWN decisions
- Focus on process, discipline, and emotional awareness
- Validate feelings before asking deeper questions
- Praise the PROCESS (e.g., "You followed your stop loss"), not the OUTCOME
- Use the Socratic method: guide through questions, don't lecture

Coaching patterns to use:
1. Reflection: "Apa yang kamu pikirkan saat kamu...?"
2. Process focus: "Bagaimana rencanamu sebelum masuk posisi?"
3. Emotional check: "Bagaimana perasaanmu saat trade itu berjalan?"
4. Learning: "Apa yang bisa kamu pelajari dari situasi ini?"
5. Positive reinforcement: "Bagus bahwa kamu sudah..."

Response style:
- Use markdown for formatting (bold, lists, quotes)
- Keep responses concise but meaningful
- Use Indonesian naturally (not stiff/formal)
- Can use light emojis occasionally for warmth
- Use > blockquotes for key insights
- Structure complex answers with headers and lists

Tone: Supportive, non-judgmental, analytical when appropriate.
Language: Indonesian (Bahasa Indonesia) unless the user writes in English.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, traderContext } = body as {
      messages: Array<{ role: string; content: string }>
      traderContext?: {
        processScore?: number | null
        totalTrades?: number
        winRate?: number
        traderName?: string | null
      }
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Build context string if trader data available
    let contextStr = ''
    if (traderContext) {
      const parts: string[] = []
      if (traderContext.traderName) parts.push(`Trader name: ${traderContext.traderName}`)
      if (traderContext.processScore !== null && traderContext.processScore !== undefined)
        parts.push(`Process Score: ${traderContext.processScore}/100`)
      if (traderContext.totalTrades !== undefined) parts.push(`Total trades: ${traderContext.totalTrades}`)
      if (traderContext.winRate !== undefined) parts.push(`Win rate: ${traderContext.winRate}%`)
      if (parts.length > 0) {
        contextStr = `\n\n[Current Trader Context: ${parts.join(', ')}]`
      }
    }

    // Build the full messages array with system prompt
    const fullMessages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT + contextStr,
      },
      ...messages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      })),
    ]

    // Use z-ai-web-dev-sdk for chat completion
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: fullMessages,
      stream: true,
    })

    // Handle streaming response
    if (!response || typeof response !== 'object') {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      )
    }

    // The SDK streaming returns an async iterable
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          if (Symbol.asyncIterator in response) {
            for await (const chunk of response as AsyncIterable<{ choices?: Array<{ delta?: { content?: string } }> }>) {
              const content = chunk?.choices?.[0]?.delta?.content
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            }
          } else if (typeof (response as unknown as { text?: () => Promise<string> }).text === 'function') {
            // Non-streaming fallback
            const text = await (response as unknown as { text: () => Promise<string> }).text()
            controller.enqueue(encoder.encode(text))
          } else {
            // Try to extract content directly
            const resp = response as unknown as { content?: string; choices?: Array<{ message?: { content?: string } }> }
            const text = resp.content || resp.choices?.[0]?.message?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (err) {
          console.error('Streaming error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Coaching API error:', error)
    return NextResponse.json(
      { error: 'Failed to process coaching request' },
      { status: 500 }
    )
  }
}
