// apps/client/src/config/supabase.js
// Supabase Client singleton for browser usage.
// Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
//
// SECURITY NOTE:
//   - Only the anon key is used here. It is safe to expose in the client bundle.
//   - All operations using this client are subject to PostgreSQL Row Level Security (RLS).
//   - NEVER expose or import the SUPABASE_SERVICE_ROLE_KEY in client code.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
