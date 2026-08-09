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

    const cookieStore = await cookies()
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
  } catch {
    // Supabase not available — demo mode
    return { user: null, isDemo: true }
  }
}
