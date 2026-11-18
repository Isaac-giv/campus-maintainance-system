/**
 * Application user roles.
 * These values must match the PostgreSQL enum public."Role" exactly.
 * Any change here requires a corresponding database migration.
 */
export const ROLES = /** @type {const} */ ({
  STUDENT: 'STUDENT',
  SUPERVISOR: 'SUPERVISOR',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
})

/** @typedef {typeof ROLES[keyof typeof ROLES]} Role */
