// apps/server/src/config/supabaseAdmin.js
// Supabase Admin client — initialised with the SERVICE_ROLE_KEY.
//
// This client is used exclusively for privileged server-side operations:
//   • Verifying user access tokens issued by Supabase Auth (GoTrue)
//   • Generating signed URLs for private storage buckets
//   • Uploading files to and deleting files from storage buckets
//   • Any GoTrue admin operations (account management)
//
// IMPORTANT:
//   • The SERVICE_ROLE_KEY is an HTTP Bearer token for the Supabase HTTP API.
//   • It is NOT a PostgreSQL database password and must NEVER be used as one.
//   • This client must NEVER be imported by any client-side code.
//   • This module is server-only.

import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

export default supabaseAdmin
