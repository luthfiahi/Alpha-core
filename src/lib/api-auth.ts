import { createRouteHandlerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Get the authenticated Supabase user from the request.
 * Demo mode is only available when Supabase is not configured.
 */
export async function getAuthUser() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
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
  } catch (err) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { user: null, isDemo: true }
    }

    console.error('[AUTH] Unexpected authentication error:', err)
    return {
      user: null,
      isDemo: false,
      error: NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 },
      ),
    }
  }
}

/**
 * Resolve the current application Trader from the verified Supabase session.
 *
 * Existing records are linked by normalized email on the owner's first login,
 * preserving all historical data without hard-coding an Auth UUID.
 */
export async function requireTrader() {
  const auth = await getAuthUser()
  if (auth.error) {
    return { trader: null, isDemo: false, error: auth.error }
  }

  if (auth.isDemo) {
    const trader = await db.trader.upsert({
      where: { email: 'trader@alpha.dev' },
      update: {},
      create: {
        email: 'trader@alpha.dev',
        name: 'Default Trader',
      },
    })

    return { trader, isDemo: true }
  }

  const authUserId = auth.user?.id
  const email = auth.user?.email?.trim().toLowerCase()

  if (!authUserId || !email) {
    return {
      trader: null,
      isDemo: false,
      error: NextResponse.json(
        { error: 'Authenticated account must have an email address' },
        { status: 403 },
      ),
    }
  }

  const linkedTrader = await db.trader.findUnique({
    where: { authUserId },
  })

  if (linkedTrader) {
    return { trader: linkedTrader, isDemo: false }
  }

  const trader = await db.trader.upsert({
    where: { email },
    update: { authUserId },
    create: {
      authUserId,
      email,
      name:
        typeof auth.user?.user_metadata?.name === 'string'
          ? auth.user.user_metadata.name
          : null,
    },
  })

  return { trader, isDemo: false }
}
