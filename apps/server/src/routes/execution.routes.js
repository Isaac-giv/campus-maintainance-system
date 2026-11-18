// apps/server/src/routes/execution.routes.js
// Worker execution and supervisor verification routes.
// Implements the two-phase completion/verification workflow from Phase 1.4 Output F.
// Implemented in Phase 2.4 (Workflow Engine).

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/rbac.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  completeJobSchema,
  verifyReportSchema,
  rejectReportSchema,
} from '@campus/shared/schemas'
import { ROLES } from '@campus/shared/constants'

const router = Router()

// PATCH /api/v1/executions/:reportId/start
// Worker marks arrival and begins work (ASSIGNED → IN_PROGRESS).
router.patch(
  '/:reportId/start',
  authenticate,
  authorize(ROLES.WORKER, ROLES.ADMIN),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.4' })
  })
)

// POST /api/v1/executions/:reportId/complete
// Worker submits completion notes and optional proof photo
// (IN_PROGRESS → AWAITING_VERIFICATION).
// File upload is handled by multer middleware added in Phase 2.4.
router.post(
  '/:reportId/complete',
  authenticate,
  authorize(ROLES.WORKER, ROLES.ADMIN),
  validate(completeJobSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.4' })
  })
)

// POST /api/v1/executions/:reportId/verify
// Supervisor inspects work and signs off (AWAITING_VERIFICATION → RESOLVED).
// Workers cannot call this endpoint (self-verification blocked by RBAC).
router.post(
  '/:reportId/verify',
  authenticate,
  authorize(ROLES.SUPERVISOR, ROLES.ADMIN),
  validate(verifyReportSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.4' })
  })
)

// POST /api/v1/executions/:reportId/reject
// Supervisor rejects deficient work (AWAITING_VERIFICATION → REJECTED).
router.post(
  '/:reportId/reject',
  authenticate,
  authorize(ROLES.SUPERVISOR, ROLES.ADMIN),
  validate(rejectReportSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.4' })
  })
)

export default router
