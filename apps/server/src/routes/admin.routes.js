// apps/server/src/routes/admin.routes.js
// Administrative endpoints — all require ADMIN role.
// Covers user management, supervisor-hostel assignment, room allocation,
// and analytics summary.
//
// Security note (Phase 1.4):
//   Role and is_active changes are performed by campus_app (Prisma) after
//   Express has verified the caller is an authenticated ADMIN.
//   The DB trigger trg_protect_profile_privilege_fields blocks authenticated
//   (PostgREST) callers from changing role/is_active directly.

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/rbac.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { ROLES, changeRoleSchema, roomAllocationSchema } from '@campus/shared'

const router = Router()

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize(ROLES.ADMIN))

// ── User management ─────────────────────────────────────────────

// GET /api/v1/admin/users — list all users (paginated)
router.get('/users', (_req, res) => {
  res.status(501).json({ message: 'GET /admin/users — not yet implemented' })
})

// GET /api/v1/admin/users/:userId — single user detail
router.get('/users/:userId', (_req, res) => {
  res.status(501).json({ message: 'GET /admin/users/:userId — not yet implemented' })
})

// PATCH /api/v1/admin/users/:userId/role — change application role
// Requires: verified ADMIN JWT + Express RBAC. campus_app UPDATE allowed by
// trigger because current_user = 'campus_app' (not 'authenticated').
router.patch('/users/:userId/role', validate(changeRoleSchema), (_req, res) => {
  res
    .status(501)
    .json({ message: 'PATCH /admin/users/:userId/role — not yet implemented' })
})

// PATCH /api/v1/admin/users/:userId/status — activate or deactivate account
router.patch('/users/:userId/status', (_req, res) => {
  res
    .status(501)
    .json({ message: 'PATCH /admin/users/:userId/status — not yet implemented' })
})

// ── Room allocation ─────────────────────────────────────────────

// PATCH /api/v1/admin/users/:userId/room-allocation
// Assigns a student to a hostel block + room. Existing open reports
// retain their original hostel_block_id/room_id (immutable after creation).
router.patch(
  '/users/:userId/room-allocation',
  validate(roomAllocationSchema),
  (_req, res) => {
    res.status(501).json({
      message: 'PATCH /admin/users/:userId/room-allocation — not yet implemented',
    })
  }
)

// ── Supervisor–hostel assignment ────────────────────────────────

// POST /api/v1/admin/supervisors/:supervisorId/hostels
// Assign a supervisor to one or more hostel blocks.
router.post('/supervisors/:supervisorId/hostels', (_req, res) => {
  res.status(501).json({
    message: 'POST /admin/supervisors/:supervisorId/hostels — not yet implemented',
  })
})

// DELETE /api/v1/admin/supervisors/:supervisorId/hostels/:blockId
// Remove a supervisor from a hostel block.
router.delete('/supervisors/:supervisorId/hostels/:blockId', (_req, res) => {
  res.status(501).json({
    message:
      'DELETE /admin/supervisors/:supervisorId/hostels/:blockId — not yet implemented',
  })
})

// ── Analytics ───────────────────────────────────────────────────

// GET /api/v1/admin/analytics/summary — global report statistics
router.get('/analytics/summary', (_req, res) => {
  res.status(501).json({ message: 'GET /admin/analytics/summary — not yet implemented' })
})

export default router
