/**
 * Report lifecycle statuses.
 * These values must match the PostgreSQL enum public."ReportStatus" exactly.
 *
 * Valid transitions (enforced by Express state machine):
 *   PENDING → ASSIGNED          (supervisor/admin assigns a worker)
 *   PENDING → CANCELLED         (student cancels before assignment)
 *   ASSIGNED → IN_PROGRESS      (worker starts the job)
 *   ASSIGNED → ASSIGNED         (supervisor reassigns to a different worker)
 *   IN_PROGRESS → AWAITING_VERIFICATION  (worker submits completion)
 *   AWAITING_VERIFICATION → RESOLVED    (supervisor verifies and signs off)
 *   AWAITING_VERIFICATION → REJECTED    (supervisor rejects deficient work)
 *   REJECTED → IN_PROGRESS      (worker begins rework)
 *   REJECTED → ASSIGNED         (supervisor reassigns to new worker)
 */
export const REPORT_STATUS = /** @type {const} */ ({
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
})

/** @typedef {typeof REPORT_STATUS[keyof typeof REPORT_STATUS]} ReportStatus */

/**
 * Allowed source statuses for each target transition.
 * Key = target status. Value = array of valid previous statuses.
 * Used by the Express state machine to validate transitions.
 */
export const VALID_TRANSITIONS = /** @type {const} */ ({
  [REPORT_STATUS.ASSIGNED]: [
    REPORT_STATUS.PENDING,
    REPORT_STATUS.ASSIGNED,
    REPORT_STATUS.REJECTED,
  ],
  [REPORT_STATUS.CANCELLED]: [REPORT_STATUS.PENDING],
  [REPORT_STATUS.IN_PROGRESS]: [REPORT_STATUS.ASSIGNED, REPORT_STATUS.REJECTED],
  [REPORT_STATUS.AWAITING_VERIFICATION]: [REPORT_STATUS.IN_PROGRESS],
  [REPORT_STATUS.RESOLVED]: [REPORT_STATUS.AWAITING_VERIFICATION],
  [REPORT_STATUS.REJECTED]: [REPORT_STATUS.AWAITING_VERIFICATION],
})
