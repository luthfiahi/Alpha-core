import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

// Error messages in Indonesian
const errorMessages: Record<string, string> = {
  otp_expired: 'Link sudah kadaluarsa. Silakan minta link baru.',
  access_denied: 'Akses ditolak. Silakan coba lagi.',
  invalid: 'Link tidak valid. Silakan minta link baru.',
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  // If Supabase returned an error in URL params (expired link, access denied, etc.)
  if (errorCode || errorDescription) {
    const friendlyMessage = errorCode
      ? errorMessages[errorCode] || errorMessages[errorCode.toLowerCase()] || 'Terjadi kesalahan saat verifikasi.'
      : 'Terjadi kesalahan saat verifikasi.'
    const detail = errorDescription ? decodeURIComponent(errorDescription) : ''

    // Redirect to home with error params so the login page can show a message
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(friendlyMessage)}&auth_detail=${encodeURIComponent(detail)}`
    )
  }

  // If no code or token_hash, redirect to home
  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/`)
  }

  try {
    const supabase = await createRouteHandlerClient()

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        const friendlyMessage = errorMessages[error.code || ''] || errorMessages[error.message?.toLowerCase() || ''] || 'Terjadi kesalahan saat verifikasi.'
        return NextResponse.redirect(
          `${origin}/?auth_error=${encodeURIComponent(friendlyMessage)}`
        )
      }
    }

    // Success — redirect to home (user will be authenticated now)
    return NextResponse.redirect(`${origin}/`)
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Terjadi kesalahan saat verifikasi.')}`)
  }
}
