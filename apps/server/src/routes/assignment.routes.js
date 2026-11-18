// apps/server/src/routes/assignment.routes.js
// Supervisor/admin triage and worker assignment routes.
// Implemented in Phase 2.4 (Workflow Engine).

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/rbac.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignReportSchema } from '@campus/shared/schemas'
import { ROLES } from '@campus/shared/constants'

const router = Router()

// POST /api/v1/assignments
// Assign an active WORKER to a report. Atomic transaction:
//   deactivates previous assignment → creates new → updates report status/worker.
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPERVISOR, ROLES.ADMIN),
  validate(assignReportSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.4' })
  })
)

// PATCH /api/v1/assignments/:id/reassign
// Revoke current assignment and reassign to a new worker.
router.patch(
  '/:id/reassign',
  authenticate,
  authorize(ROLES.SUPERVISOR, ROLES.ADMIN),
  validate(assignReportSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.4' })
  })
)

export default router
