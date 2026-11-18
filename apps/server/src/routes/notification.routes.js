// apps/server/src/routes/notification.routes.js
// Notification endpoints — all require authentication.
// Notifications are created server-side by Express during report state
// transitions. Users only read and mark their own notifications.
//
// Supabase Realtime is the preferred delivery channel for live updates.
// These REST endpoints serve polling fallback and batch read-status updates.

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// All notification routes require authentication
router.use(authenticate)

// GET /api/v1/notifications
// Returns the authenticated user's notifications (own only).
// Optional query params: ?unreadOnly=true&limit=20&cursor=<id>
router.get('/', (_req, res) => {
  res.status(501).json({ message: 'GET /notifications — not yet implemented' })
})

// GET /api/v1/notifications/unread-count
// Lightweight endpoint for notification badge.
router.get('/unread-count', (_req, res) => {
  res
    .status(501)
    .json({ message: 'GET /notifications/unread-count — not yet implemented' })
})

// PATCH /api/v1/notifications/:notificationId/read
// Mark a single notification as read.
// Express verifies the notification belongs to req.user.profile.id.
router.patch('/:notificationId/read', (_req, res) => {
  res
    .status(501)
    .json({ message: 'PATCH /notifications/:notificationId/read — not yet implemented' })
})

// PATCH /api/v1/notifications/read-all
// Mark all of the authenticated user's notifications as read.
router.patch('/read-all', (_req, res) => {
  res.status(501).json({ message: 'PATCH /notifications/read-all — not yet implemented' })
})

export default router
