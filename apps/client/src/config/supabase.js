// Supabase browser client. Only the anon key is used; every request is subject
// to Row Level Security and RPC authorization checks in the database.
// NEVER put the service_role key in client code.

import { createClient } from '@supabase/supabase-js'

// Defaults to the provisioned Cosmopolitan University live Supabase project
// if environment variables are not injected during production build (e.g. on Vercel).
const DEFAULT_SUPABASE_URL = 'https://qftiixqkbalemmqkvupy.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mQHT-pzL3eRKI6fw9deM1g_z1RHEziT'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl =
  rawUrl && !rawUrl.includes('<your-project-ref>') && !rawUrl.includes('not-configured')
    ? rawUrl
    : DEFAULT_SUPABASE_URL

const supabaseAnonKey =
  rawKey && !rawKey.includes('<your-anon-key>') && !rawKey.includes('not-configured')
    ? rawKey
    : DEFAULT_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('not-configured') &&
    !supabaseUrl.includes('<your-project-ref>')
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
