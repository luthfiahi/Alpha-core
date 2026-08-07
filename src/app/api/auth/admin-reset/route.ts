import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin route: reset user password directly (bypasses email rate limit)
// Requires SUPABASE_SERVICE_ROLE_KEY env var (server-only, NOT exposed to client)
export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email dan password baru wajib diisi' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json(
        { error: 'Server Supabase config tidak ditemukan' },
        { status: 500 }
      )
    }

    // Use service_role client (bypasses RLS and email rate limits)
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // First, find the user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error('[ADMIN RESET] List users error:', listError)
      return NextResponse.json(
        { error: 'Gagal mencari user' },
        { status: 500 }
      )
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update user password directly via Admin API
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('[ADMIN RESET] Update error:', updateError)
      return NextResponse.json(
        { error: `Gagal update password: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('[ADMIN RESET] Password updated for:', email)

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset. Silakan coba login.',
    })
  } catch (err) {
    console.error('[ADMIN RESET] Exception:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat reset password' },
      { status: 500 }
    )
  }
}
