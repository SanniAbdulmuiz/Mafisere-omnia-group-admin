import { createClient } from '@supabase/supabase-js'

// Public Supabase values are safe to expose to browser code because they use the anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Fail early during startup if the app cannot connect to Supabase.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in .env.local')
}

// Shared browser/client Supabase client, mainly used for public storage uploads.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
