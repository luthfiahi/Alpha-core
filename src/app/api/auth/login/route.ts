import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Map common errors to Indonesian
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email atau password salah',
        'Email not confirmed': 'Email belum diverifikasi. Cek inbox atau spam kamu.',
        'Too many requests': 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.',
      }
      const message = errorMap[error.message] || error.message

      return NextResponse.json(
        { error: message },
        { status: 401 }
      )
    }

    const { user } = data

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
