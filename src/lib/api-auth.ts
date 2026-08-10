import { createRouteHandlerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Get the authenticated user from the request.
 * Returns { user, error } — if error, caller should return the NextResponse.
 * Returns null user when Supabase is not configured (demo mode).
 */
export async function getAuthUser() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Demo mode — no auth required
      return { user: null, isDemo: true }
    }

    // Debug bypass: check for alpha-demo=1 cookie
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get('alpha-demo')
    if (demoCookie?.value === '1') {
      return { user: null, isDemo: true }
    }

    const supabase = await createRouteHandlerClient(cookieStore)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        user: null,
        isDemo: false,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      }
    }

    return { user, isDemo: false }
  } catch (err) {
    // Only use demo mode when Supabase isn't configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return { user: null, isDemo: true }
    }
    // Real error — don't silently grant access
    console.error('[AUTH] Unexpected error in getAuthUser:', err)
    return {
      user: null,
      isDemo: false,
      error: new Response(JSON.stringify({ error: 'Authentication error' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }
}
