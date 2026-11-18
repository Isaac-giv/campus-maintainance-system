/**
 * Report priority levels.
 * These values must match the PostgreSQL enum public."Priority" exactly.
 */
export const PRIORITY = /** @type {const} */ ({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  EMERGENCY: 'EMERGENCY',
})

/** @typedef {typeof PRIORITY[keyof typeof PRIORITY]} Priority */
