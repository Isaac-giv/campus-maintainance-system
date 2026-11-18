// apps/server/src/config/prisma.js
// Singleton Prisma Client instance for the Express server.
//
// Connects to Supabase PostgreSQL via the campus_app login role using the
// Supavisor Session Pooler (DATABASE_URL). This role has LOGIN, NOBYPASSRLS,
// NOSUPERUSER, and only the minimum required table privileges defined in the
// Phase 1.4 database grant specification.
//
// The Prisma CLI uses DIRECT_URL (a separate admin connection) for migrations.
// DIRECT_URL is never used at runtime.

import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

const globalForPrisma = globalThis

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['query', 'warn', 'error'] : ['warn', 'error'],
  })

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma
}

export default prisma
