// Supabase browser client. Only the anon key is used; every request is subject
// to Row Level Security and RPC authorization checks in the database.
// NEVER put the service_role key in client code.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('<your-project-ref>')
)

export const supabase = createClient(
  supabaseUrl || 'https://not-configured.supabase.co',
  supabaseAnonKey || 'not-configured',
  {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }
)
