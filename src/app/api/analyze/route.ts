import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { getAuthUser } from '@/lib/api-auth'

const ANALYSIS_PROMPT = `Analyze this trading chart screenshot. Extract the following information in JSON format:
{
  "pair": "currency pair or instrument (e.g., EURUSD, BTCUSD)",
  "timeframe": "chart timeframe if visible",
  "direction": "LONG or SHORT based on the last entry signal visible",
  "entryPrice": "entry price if visible",
  "stopLoss": "stop loss level if visible",
  "takeProfit": "take profit level if visible",
  "pattern": "chart pattern visible (e.g., double top, breakout, etc.)",
  "trend": "overall trend direction",
  "confidence": "your confidence level 0-100",
  "notes": "additional observations"
}

IMPORTANT: Only extract what is actually visible in the chart. If something is not visible, set it to null.
Respond ONLY with valid JSON, no extra text.`

interface ChartAnalysis {
  pair: string | null
  timeframe: string | null
  direction: string | null
  entryPrice: string | null
  stopLoss: string | null
  takeProfit: string | null
  pattern: string | null
  trend: string | null
  confidence: number | null
  notes: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, mimeType } = body as {
      image: string
      mimeType: 'image/png' | 'image/jpeg'
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    const { error: authError } = await getAuthUser()
    if (authError) return authError

    const validMime = mimeType || 'image/png'
    const dataUrl = `data:${validMime};base64,${image}`

    const zai = await ZAI.create()

    // Use VLM for image analysis
    const response = await zai.chat.completions.createVision({
      model: process.env.ZAI_VISION_MODEL || 'default',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    // Extract text from response
    let responseText = ''
    if (typeof response === 'string') {
      responseText = response
    } else if (response && typeof response === 'object') {
      const resp = response as unknown as {
        content?: string
        choices?: Array<{ message?: { content?: string } }>
      }
      responseText = resp.content || resp.choices?.[0]?.message?.content || ''
    }

    // Parse the JSON response
    let analysis: ChartAnalysis
    try {
      // Try to extract JSON from the response (might have markdown code blocks)
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) 
        || responseText.match(/\{[\s\S]*\}/)
      
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      analysis = JSON.parse(jsonStr.trim()) as ChartAnalysis
    } catch {
      // If parsing fails, return the raw text as notes
      analysis = {
        pair: null,
        timeframe: null,
        direction: null,
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        pattern: null,
        trend: null,
        confidence: null,
        notes: responseText || 'Failed to parse chart data from the image.',
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Screenshot analysis error:', error)
    return NextResponse.json(
      {
        pair: null,
        timeframe: null,
        direction: null,
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        pattern: null,
        trend: null,
        confidence: null,
        notes: 'Failed to analyze screenshot. Please try again with a clearer image.',
        error: 'Analysis failed',
      },
      { status: 500 }
    )
  }
}
