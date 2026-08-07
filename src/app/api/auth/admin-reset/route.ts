import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin route: reset user password directly (bypasses email rate limit)
// Uses Supabase Admin API (service_role key) — NOT exposed to client
// Will create user if they don't exist, or update password if they do
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
      console.error('[ADMIN RESET] Missing env vars')
      return NextResponse.json(
        { error: 'Server config tidak ditemukan. Hubungi admin.' },
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

    const normalizedEmail = email.trim().toLowerCase()

    // Step 1: Try to create user with new password
    const { data: createUser, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: newPassword,
      email_confirm: true,
    })

    if (createError) {
      const errorMsg = createError.message.toLowerCase()

      // User already exists → find them and update password
      if (errorMsg.includes('already registered') || errorMsg.includes('already exists') || errorMsg.includes('user already')) {
        console.log('[ADMIN RESET] User exists, finding and updating...')

        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()

        if (listError) {
          console.error('[ADMIN RESET] List users error:', listError)
          return NextResponse.json(
            { error: 'Gagal mencari user di database' },
            { status: 500 }
          )
        }

        // Find user by email (case-insensitive)
        const user = users.find(u => u.email?.toLowerCase() === normalizedEmail)

        if (!user) {
          console.error('[ADMIN RESET] User not in list but create said exists:', normalizedEmail)
          console.error('[ADMIN RESET] User emails in DB:', users.map(u => u.email))
          return NextResponse.json(
            { error: 'Email tidak ditemukan di database. Coba daftar akun baru.' },
            { status: 404 }
          )
        }

        // Update password via Admin API
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

        console.log('[ADMIN RESET] Password updated for existing user:', normalizedEmail)
        return NextResponse.json({
          success: true,
          message: 'Password berhasil direset. Silakan coba login.',
        })
      }

      // Some other creation error
      console.error('[ADMIN RESET] Create user error:', createError)
      return NextResponse.json(
        { error: `Gagal membuat user: ${createError.message}` },
        { status: 500 }
      )
    }

    // User was created successfully
    console.log('[ADMIN RESET] New user created:', normalizedEmail, 'ID:', createUser.user?.id)
    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat dengan password baru. Silakan coba login.',
    })
  } catch (err) {
    console.error('[ADMIN RESET] Exception:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat reset password' },
      { status: 500 }
    )
  }
}
