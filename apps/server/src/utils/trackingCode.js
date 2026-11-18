// apps/server/src/utils/trackingCode.js
// Generates unique maintenance report tracking codes for Cosmopolitan University.
//
// Format:  CU-YYYY-NNNNNN
// Example: CU-2026-000042
//
// The numeric part uses a PostgreSQL SEQUENCE (report_tracking_seq) to guarantee
// global uniqueness without race conditions. The sequence is queried by Express
// inside the report creation transaction via Prisma.$queryRaw.
//
// The sequence must be created in the database migration and campus_app must have
// USAGE granted on it. See Phase 1.4 Output H, Assumption 3.

/**
 * Formats a tracking code from the year and sequence value.
 * @param {number} year - Four-digit year.
 * @param {number|bigint} sequenceValue - Value from report_tracking_seq.
 * @returns {string} - e.g. 'CU-2026-000042'
 */
export function formatTrackingCode(year, sequenceValue) {
  const padded = String(sequenceValue).padStart(6, '0')
  return `CU-${year}-${padded}`
}

/**
 * Fetches the next sequence value from PostgreSQL and returns a tracking code.
 * Must be called inside a Prisma transaction (pass the tx client).
 *
 * @param {import('@prisma/client').PrismaClient} tx - Transaction-scoped Prisma client.
 * @returns {Promise<string>}
 */
export async function generateTrackingCode(tx) {
  const result = await tx.$queryRaw`SELECT nextval('report_tracking_seq') AS seq`
  const year = new Date().getFullYear()
  return formatTrackingCode(year, result[0].seq)
}
