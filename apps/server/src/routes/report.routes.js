// apps/server/src/routes/report.routes.js
// Maintenance report submission and tracking routes.
// Implemented in Phase 2.3 (Reporting Engine).

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/rbac.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createReportSchema, cancelReportSchema } from '@campus/shared/schemas'
import { ROLES } from '@campus/shared/constants'

const router = Router()

// POST /api/v1/reports
// Student submits a new maintenance report.
// hostel_block_id and room_id are derived server-side from the student's profile.
router.post(
  '/',
  authenticate,
  authorize(ROLES.STUDENT, ROLES.ADMIN),
  validate(createReportSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.3' })
  })
)

// GET /api/v1/reports
// Lists reports scoped to the caller's role.
router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.3' })
  })
)

// GET /api/v1/reports/:id
// Returns a single report with status history and signed attachment URLs.
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.3' })
  })
)

// PATCH /api/v1/reports/:id/cancel
// Student cancels their own PENDING report.
router.patch(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.STUDENT, ROLES.ADMIN),
  validate(cancelReportSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.3' })
  })
)

export default router
