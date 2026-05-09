import 'server-only'

import { createClient } from '@supabase/supabase-js'

// The service role key is private and must only be used on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function getSupabaseAdmin() {
  // Throw inside the function so importing this module does not crash until it is actually used.
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing server Supabase admin environment variables')
  }

  // Admin client bypasses row-level security, so it is reserved for trusted server code.
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Server actions/queries do not need a browser-like persisted auth session.
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
