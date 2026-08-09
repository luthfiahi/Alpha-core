import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token_hash } = await request.json()

    if (!token_hash || typeof token_hash !== 'string') {
      return NextResponse.json(
        { error: 'Token hash wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email',
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    const { user } = data

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat verifikasi token' },
      { status: 500 }
    )
  }
}
