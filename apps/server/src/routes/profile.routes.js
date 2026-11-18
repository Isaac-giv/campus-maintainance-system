// apps/server/src/routes/profile.routes.js
// Profile synchronisation and self-service update routes.
// Implemented in Phase 2.2 (Auth & Profile).

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { profileSyncSchema, profileUpdateSchema } from '@campus/shared/schemas'

const router = Router()

// POST /api/v1/profile/sync
// Idempotent upsert called after Supabase Auth registration.
// Creates profile with role = STUDENT. Subsequent calls update contact info only.
router.post(
  '/sync',
  authenticate,
  validate(profileSyncSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.2' })
  })
)

// GET /api/v1/profile/me
// Returns the authenticated user's profile.
router.get(
  '/me',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.2' })
  })
)

// PATCH /api/v1/profile/me
// Updates fullName and phoneNumber only.
router.patch(
  '/me',
  authenticate,
  validate(profileUpdateSchema),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented yet — Phase 2.2' })
  })
)

export default router
