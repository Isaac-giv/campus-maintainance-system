// apps/server/src/config/env.js
// Validates and exports all required environment variables at startup.
// The server will not start if any required variable is missing.

function requireEnv(name) {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        `Copy apps/server/.env.example to apps/server/.env and fill in all values.`
    )
  }
  return value.trim()
}

function optionalEnv(name, defaultValue) {
  const value = process.env[name]
  return value && value.trim() !== '' ? value.trim() : defaultValue
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '3001'), 10),

  // Supabase project — HTTP API credentials
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),

  // Service-role key — used ONLY for Express Admin SDK calls.
  // This is NOT a PostgreSQL database password.
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // PostgreSQL wire-protocol connection strings (never the service-role key)
  DATABASE_URL: requireEnv('DATABASE_URL'),
  DIRECT_URL: requireEnv('DIRECT_URL'),

  // CORS — comma-separated list of allowed origins
  CORS_ORIGIN: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_AUTH_MAX: parseInt(optionalEnv('RATE_LIMIT_AUTH_MAX', '20'), 10),

  // Signed URL lifetime (seconds)
  SIGNED_URL_TTL_SECONDS: parseInt(optionalEnv('SIGNED_URL_TTL_SECONDS', '900'), 10),

  get isDevelopment() {
    return this.NODE_ENV === 'development'
  },
  get isProduction() {
    return this.NODE_ENV === 'production'
  },
}
