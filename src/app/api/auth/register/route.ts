import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama minimal 2 karakter' },
        { status: 400 }
      )
    }

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

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      // Map common errors to Indonesian
      const errorMap: Record<string, string> = {
        'User already registered': 'EMAIL_EXISTS',
        'Password should be at least 6 characters.': 'Password minimal 6 karakter.',
        'email rate limit exceeded': 'Terlalu banyak permintaan email. Tunggu 5-10 menit lalu coba lagi.',
        'Email rate limit exceeded': 'Terlalu banyak permintaan email. Tunggu 5-10 menit lalu coba lagi.',
      }
      const message = errorMap[error.message] || error.message

      return NextResponse.json(
        { error: message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat. Cek email untuk verifikasi.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    )
  }
}
