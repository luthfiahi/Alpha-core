import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')

  // If no code or token_hash, redirect to home
  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/`)
  }

  try {
    const supabase = await createRouteHandlerClient()

    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }
    // token_hash is handled by the verify endpoint

    return NextResponse.redirect(`${origin}/`)
  } catch {
    return NextResponse.redirect(`${origin}/`)
  }
}
