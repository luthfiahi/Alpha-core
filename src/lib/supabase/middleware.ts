import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session so it doesn't expire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Do not redirect API routes or auth callback
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
  if (isApiRoute || isAuthCallback) {
    return supabaseResponse
  }

  // If no user and not on the root page, redirect to root
  // (Our app is a SPA — the login page is rendered client-side at /)
  // We don't do server-side redirects for auth, the client handles it.
  // The middleware just ensures the session cookie is fresh.

  return supabaseResponse
}
