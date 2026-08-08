import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null
let _clientFailed = false

function getClient() {
  if (_clientFailed) return null
  if (!_client) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (!url || !key) {
        console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Auth features disabled.')
        _clientFailed = true
        return null
      }
      _client = createBrowserClient(url, key)
    } catch (err) {
      console.error('[Supabase] Failed to create client:', err)
      _clientFailed = true
      return null
    }
  }
  return _client
}

// Lazy Supabase browser client — defers creation until first use
export const supabase = {
  get auth() {
    const client = getClient()
    if (!client) {
      return {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured', status: 0 } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured', status: 0 } }),
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured', status: 0 } }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      }
    }
    return client.auth
  },
}
