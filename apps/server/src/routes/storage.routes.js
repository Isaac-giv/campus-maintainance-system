// apps/server/src/routes/storage.routes.js
// Storage endpoints: Express acts as a secure intermediary between the
// client and Supabase Storage. No direct client-to-storage uploads.
//
// Upload flow (Phase 1.4 Output E):
//   1. Client POSTs multipart file to Express
//   2. Express: verify JWT → load profile → load report → authorization →
//      magic byte inspection → size check → upload via Admin SDK → DB record
//
// Signed URL flow:
//   POST /storage/signed-urls — Express verifies stakeholder, then issues
//   signed URLs via Admin SDK (service_role HTTP key).

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { signedUrlRequestSchema } from '@campus/shared'

const router = Router()

// All storage routes require authentication
router.use(authenticate)

// ── File upload ─────────────────────────────────────────────────
// POST /api/v1/storage/reports/:reportId/attachments
// Upload a report photo (stage=initial) or resolution evidence (stage=resolution).
// Multer middleware and magic-byte validation added in Phase 2.x.
router.post('/reports/:reportId/attachments', (_req, res) => {
  res.status(501).json({
    message: 'POST /storage/reports/:reportId/attachments — not yet implemented',
  })
})

// ── Signed URLs ─────────────────────────────────────────────────
// POST /api/v1/storage/signed-urls
// Body: { paths: [{ bucket, storagePath }] }
// Express verifies the caller is a stakeholder of each referenced report
// before calling supabaseAdmin.storage.createSignedUrl().
// TTL: 900 seconds (15 min) per Phase 1.4 Output E §4.
router.post('/signed-urls', validate(signedUrlRequestSchema), (_req, res) => {
  res.status(501).json({ message: 'POST /storage/signed-urls — not yet implemented' })
})

export default router
