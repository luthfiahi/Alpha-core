import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    _client = createBrowserClient(url, key)
  }
  return _client
}

// Lazy Supabase browser client — defers creation until first use
export const supabase = {
  get auth() {
    return getClient().auth
  },
}
