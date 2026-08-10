import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    // If Supabase middleware fails, don't block the request entirely.
    // Log the error but let the request through.
    console.error('[Middleware] Supabase error (non-blocking):', error)
    return NextResponse.next({
      request,
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/trpc).*)',
  ],
}
