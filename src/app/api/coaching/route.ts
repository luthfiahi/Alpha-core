import { NextRequest, NextResponse } from 'next/server'
import { buildTraderContext } from '@/lib/ai/memory/context-builder'
import { formatMemoryContextForPrompt } from '@/lib/ai/memory/types'
import { db } from '@/lib/db'
import { createZAI } from '@/lib/zai'

// ========================================
// Free Chat System Prompt
// ========================================

const FREE_CHAT_SYSTEM_PROMPT = `You are Alpha, an AI Trading Coach. Your role is to help traders reflect on their decisions and improve their process.

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

// ========================================
// Reflection Flow System Prompt
// ========================================

const REFLECTION_SYSTEM_PROMPT = `You are Alpha, an AI Trading Coach conducting a **Structured Trade Reflection** session. You are guiding a trader through a 5-step Socratic reflection process about a specific trade.

CRITICAL RULES (Alpha Promise):
- NEVER suggest buy/sell/entry/exit points or trading signals
- NEVER make trading decisions for the user
- Focus ONLY on helping the trader reflect on their PAST decisions

## Your Role in Reflection Mode

You are conducting a **structured 5-step reflection flow**. You will guide the trader through each step by asking focused Socratic questions. The trader has selected a specific trade to reflect on.

## The 5 Steps

### Step 1: Entry Analysis (Analisis Entry)
**Goal**: Understand the trader's reasoning for entering the trade.
**Your approach**: Ask the trader to explain WHY they entered the trade. What did they see on the chart? What was their thought process?
**First message for this step**: "Aku lihat kamu baru saja melakukan trade **{pair} {direction}**. Mari kita mulai refleksi. 📋

**Langkah 1: Analisis Entry**

Ceritakan mengapa kamu entry pada trade ini? Apa yang kamu lihat di chart? Apa yang membuat kamu yakin untuk masuk posisi?"

**After trader responds**: Acknowledge their answer briefly, validate their thought process, then say you're moving to the next step.

### Step 2: Plan Evaluation (Evaluasi Rencana)
**Goal**: Evaluate if the trade followed the trader's plan.
**Your approach**: Ask if the trade followed their setup plan. If there's a playbook linked, reference specific checklist items.
**First message**: "**Langkah 2: Evaluasi Rencana** 📝

Apakah trade ini sesuai dengan setup plan kamu? Coba cek playbook yang kamu gunakan.

{playbookContext}

Apakah kamu sudah memenuhi semua checklist sebelum entry?"

**After trader responds**: Brief analysis, then move to step 3.

### Step 3: Behavioral Check (Cek Perilaku)
**Goal**: Check for rule-breaking behavior during the trade.
**Your approach**: Ask if there were temptations to break rules during the trade.
**First message**: "**Langkah 3: Cek Perilaku** 🛡️

Selama trade ini, apakah ada sesuatu yang hampir membuatmu melanggar aturan? Misalnya, tergoda untuk memindahkan stop loss, menambah posisi, atau close terlalu cepat?

Jujur saja — ini adalah ruang yang aman untuk refleksi."

**After trader responds**: Validate their honesty, note any behavioral patterns, then move to step 4.

### Step 4: Emotion Assessment (Penilaian Emosi)
**Goal**: Understand the emotional state during the trade.
**Your approach**: Ask about emotions and how they influenced decisions.
**First message**: "**Langkah 4: Penilaian Emosi** ❤️

Apa yang kamu rasakan selama trade ini? Bagaimana emosimu mempengaruhi keputusan kamu?

Misalnya: apakah kamu merasa cemas, serakah, sabar, takut, atau tenang? Kapan emosi itu muncul?"

**After trader responds**: Help them connect emotions to decisions, then move to step 5.

### Step 5: Growth Commitment (Komitmen Tumbuh)
**Goal**: Extract actionable learning and commitment for the future.
**Your approach**: Ask what they will do differently next time.
**First message**: "**Langkah 5: Komitmen Tumbuh** 🚀

Berdasarkan refleksi ini, apa yang akan kamu lakukan berbeda besok?

Coba tulis **1-2 komitmen spesifik** yang bisa kamu terapkan di trade berikutnya."

**After trader responds**: Provide a comprehensive **Reflection Summary**.

## Reflection Summary (Generated after Step 5)

After the trader responds to step 5, you MUST generate a comprehensive summary in this exact format:

---

### 📊 Ringkasan Refleksi Trade — {pair} {direction}

**🔍 Analisis Entry:**
[Brief summary of entry reasoning]

**📝 Evaluasi Rencana:**
[Brief summary of plan compliance]

**🛡️ Cek Perilaku:**
[Brief summary of behavioral observations]

**❤️ Penilaian Emosi:**
[Brief summary of emotional state]

**🚀 Komitmen Tumbuh:**
[The specific commitments the trader made]

> **Key Insight:** [One most important insight from the entire reflection]

---

## Important Rules for Reflection Mode
- Stay on the current step. Do NOT skip steps or go backwards.
- Use the step headers clearly (e.g., "**Langkah 2: Evaluasi Rencana**").
- Keep questions focused on the CURRENT step only.
- Use Indonesian naturally.
- Be warm and non-judgmental.
- After the trader responds to each step (steps 1-4), acknowledge briefly (1-2 sentences max) and transition to the next step.
- After step 5, provide the full summary above.

Response style:
- Use markdown for formatting (bold, lists, quotes)
- Use Indonesian naturally (not stiff/formal)
- Can use light emojis for step headers
- Use > blockquotes for key insights
`

// ========================================
// Step Prompts — Used for the FIRST message of each step
// ========================================

function getStepPrompt(
  step: number,
  tradeData?: Record<string, unknown>
): string {
  const pair = (tradeData?.pair as string) || 'N/A'
  const direction = (tradeData?.direction as string) || 'N/A'
  const profitLoss = Number(tradeData?.profitLoss) || 0
  const plStr = tradeData?.profitLoss !== undefined && tradeData?.profitLoss !== null
    ? (profitLoss >= 0 ? `+${profitLoss.toFixed(2)}` : profitLoss.toFixed(2))
    : 'N/A'

  switch (step) {
    case 1:
      return `Aku lihat kamu baru saja melakukan trade **${pair} ${direction}** (P/L: ${plStr}). Mari kita mulai refleksi! 📋

**Langkah 1/5: Analisis Entry** 🔍

Ceritakan mengapa kamu entry pada trade ini? Apa yang kamu lihat di chart? Apa yang membuat kamu yakin untuk masuk posisi?

Jelaskan thought process-mu sebelum klik "buy" atau "sell".`
    case 2:
      return `**Langkah 2/5: Evaluasi Rencana** 📝

Apakah trade ini sesuai dengan setup plan kamu? Coba cek playbook yang kamu gunakan.

Apakah kamu sudah memenuhi semua checklist sebelum entry? Apakah ada yang kamu lewatkan?

Jika kamu tidak menggunakan playbook, ceritakan apa rencanamu sebelum masuk posisi ini.`
    case 3:
      return `**Langkah 3/5: Cek Perilaku** 🛡️

Selama trade ini berjalan, apakah ada sesuatu yang hampir membuatmu melanggar aturan? Misalnya:
- Tergoda untuk memindahkan stop loss?
- Ingin menambah posisi (overtrading)?
- Close terlalu cepat karena panik?
- Membiarkan loss melebihi batas yang ditentukan?

Jujur saja — ini adalah ruang yang aman untuk berefleksi.`
    case 4:
      return `**Langkah 4/5: Penilaian Emosi** ❤️

Apa yang kamu rasakan selama trade ini? Bagaimana emosimu mempengaruhi keputusan kamu?

Coba identifikasi momen-momen spesifik:
- Saat pertama kali masuk posisi — apa yang kamu rasakan?
- Saat trade bergerak melawan/seperti arahmu — bagaimana reaksimu?
- Saat menutup posisi — apa perasaanmu saat itu?`
    case 5:
      return `**Langkah 5/5: Komitmen Tumbuh** 🚀

Ini adalah langkah terakhir! Berdasarkan refleksi selama 4 langkah sebelumnya, apa yang akan kamu lakukan berbeda besok?

Coba tulis **1-2 komitmen spesifik** yang bisa kamu terapkan di trade berikutnya. Misalnya:
- "Saya akan selalu menunggu konfirmasi setup sebelum entry"
- "Saya tidak akan memindahkan stop loss dalam keadaan apapun"

Apa komitmenmu?`
    default:
      return 'Lanjutkan refleksi...'
  }
}

// ========================================
// L0 Event Helper (non-blocking)
// ========================================

async function fireL0Event(eventType: string, eventData: Record<string, unknown>) {
  try {
    const trader = await db.trader.findFirst()
    if (!trader) return
    await db.memoryL0Event.create({
      data: {
        traderId: trader.id,
        eventType,
        eventData: JSON.stringify(eventData),
      },
    })
  } catch {
    // Silently ignore — L0 events are fire-and-forget.
    // Table might not exist in early deployment.
  }
}

// ========================================
// POST Handler
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      messages,
      traderContext,
      mode,
      reflectionStep,
      tradeData,
    } = body as {
      messages: Array<{ role: string; content: string }>
      traderContext?: {
        processScore?: number | null
        totalTrades?: number
        winRate?: number
        traderName?: string | null
      }
      mode?: 'FREE_CHAT' | 'REFLECTION'
      reflectionStep?: number
      tradeData?: Record<string, unknown>
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Allow empty messages for reflection mode (initial step prompt)
    if (messages.length === 0 && mode !== 'REFLECTION') {
      return NextResponse.json(
        { error: 'At least one message is required for free chat mode' },
        { status: 400 }
      )
    }

    // Determine which system prompt to use
    const isReflection = mode === 'REFLECTION'
    const step = reflectionStep || 1

    let systemPrompt = FREE_CHAT_SYSTEM_PROMPT
    let contextStr = ''

    if (isReflection) {
      systemPrompt = REFLECTION_SYSTEM_PROMPT

      // Add trade data context
      if (tradeData) {
        contextStr = `\n\n[Trade Data Being Reflected:\n- Pair: ${tradeData.pair || 'N/A'}\n- Direction: ${tradeData.direction || 'N/A'}\n- Entry Price: ${tradeData.entryPrice || 'N/A'}\n- Stop Loss: ${tradeData.stopLoss || 'N/A'}\n- Take Profit: ${tradeData.takeProfit || 'N/A'}\n- P/L: ${tradeData.profitLoss ?? 'N/A'}\n- Status: ${tradeData.status || 'N/A'}\n- Current Reflection Step: ${step}/5]`
      } else {
        contextStr = `\n\n[Current Reflection Step: ${step}/5]`
      }
    }

    // Build full memory context from the AI Memory System
    let memoryContextStr = ''
    try {
      const traderId = (traderContext as Record<string, unknown> | undefined)?.traderId as string | undefined
      const fullContext = await buildTraderContext(traderId)
      if (fullContext.traderId) {
        memoryContextStr = '\n\n' + formatMemoryContextForPrompt(fullContext)
      }
    } catch (memErr) {
      console.error('Failed to build memory context (non-blocking):', memErr)
    }

    // Add legacy trader context (kept for backward compatibility)
    if (traderContext && !memoryContextStr) {
      const parts: string[] = []
      if (traderContext.traderName) parts.push(`Trader name: ${traderContext.traderName}`)
      if (traderContext.processScore !== null && traderContext.processScore !== undefined)
        parts.push(`Process Score: ${traderContext.processScore}/100`)
      if (traderContext.totalTrades !== undefined) parts.push(`Total trades: ${traderContext.totalTrades}`)
      if (traderContext.winRate !== undefined) parts.push(`Win rate: ${traderContext.winRate}%`)
      if (parts.length > 0) {
        memoryContextStr = `\n\n[Current Trader Context: ${parts.join(', ')}]`
      }
    }

    // Combine context strings
    contextStr += memoryContextStr

    // Build the full messages array with system prompt
    // NOTE: z-ai-web-dev-sdk uses 'assistant' role for system prompts
    const fullMessages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      {
        role: 'assistant',
        content: systemPrompt + contextStr,
      },
    ]

    // If reflection mode and no previous messages, return the step prompt directly (no LLM call needed)
    if (isReflection && messages.length === 0 && step >= 1 && step <= 5) {
      const stepPrompt = getStepPrompt(step, tradeData)

      // Fire L0 event (non-blocking)
      fireL0Event('CoachSessionCompleted', {
        sessionType: 'REFLECTION',
        step,
        messageCount: 0,
      }).catch(() => { /* non-blocking */ })

      // Return step prompt as a text stream for typing effect
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder()
          const words = stepPrompt.split(/(\s+)/)
          let i = 0
          function sendNext() {
            if (i < words.length) {
              controller.enqueue(encoder.encode(words[i]))
              i++
              setTimeout(sendNext, 8)
            } else {
              controller.close()
            }
          }
          sendNext()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Include conversation history
    fullMessages.push(
      ...messages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      }))
    )

    // Use z-ai-web-dev-sdk for chat completion (non-streaming, with typing effect via ReadableStream)
    const zai = await createZAI()

    let aiText = ''

    try {
      const response = await zai.chat.completions.create({
        messages: fullMessages,
        thinking: { type: 'disabled' },
      })

      aiText = response.choices?.[0]?.message?.content || ''
    } catch (aiErr) {
      console.error('AI SDK call failed:', aiErr)
      return NextResponse.json(
        { error: 'AI Coach sedang tidak tersedia. Coba lagi nanti.' },
        { status: 503 }
      )
    }

    if (!aiText || aiText.trim().length === 0) {
      return NextResponse.json(
        { error: 'AI Coach tidak memberikan respons. Coba lagi.' },
        { status: 502 }
      )
    }

    // Fire L0 event for coaching session (non-blocking)
    fireL0Event('CoachSessionCompleted', {
      sessionType: mode || 'FREE_CHAT',
      step: isReflection ? step : undefined,
      messageCount: messages.length,
    }).catch(() => { /* non-blocking */ })

    // Return as a simple text stream (client reads chunks)
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        // Split text into small chunks for a "typing" effect
        const words = aiText.split(/(\s+)/)
        let i = 0
        function sendNext() {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i]))
            i++
            // Small delay between chunks for typing effect
            setTimeout(sendNext, 8)
          } else {
            controller.close()
          }
        }
        sendNext()
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
