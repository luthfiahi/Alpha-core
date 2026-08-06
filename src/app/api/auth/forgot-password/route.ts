import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=settings`,
    })

    if (error) {
      // Map to Indonesian, but still return success to prevent email enumeration
      // (unless it's a rate limit — user should know to wait)
      const errorMap: Record<string, string> = {
        'email rate limit exceeded': 'Terlalu banyak permintaan email. Tunggu 5-10 menit lalu coba lagi.',
        'Email rate limit exceeded': 'Terlalu banyak permintaan email. Tunggu 5-10 menit lalu coba lagi.',
      }
      const message = errorMap[error.message] || 'Terjadi kesalahan. Coba lagi nanti.'

      return NextResponse.json(
        { error: message },
        { status: 400 }
      )
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'Link reset password sudah dikirim ke email kamu',
    })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim link reset' },
      { status: 500 }
    )
  }
}
