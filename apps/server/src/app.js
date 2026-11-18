// apps/server/src/app.js
// Express application factory. Wires middleware and mounts route modules.

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error.middleware.js'
import { notFound } from './middleware/notFound.middleware.js'

// Route modules (stubs — implemented in later phases)
import profileRoutes from './routes/profile.routes.js'
import reportRoutes from './routes/report.routes.js'
import assignmentRoutes from './routes/assignment.routes.js'
import executionRoutes from './routes/execution.routes.js'
import masterDataRoutes from './routes/masterData.routes.js'
import storageRoutes from './routes/storage.routes.js'
import adminRoutes from './routes/admin.routes.js'
import notificationRoutes from './routes/notification.routes.js'

export function createApp() {
  const app = express()

  // ── Security headers ──────────────────────────────────────
  app.use(helmet())

  // ── CORS ──────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  // ── Body parsers ──────────────────────────────────────────
  // JSON bodies for standard API requests.
  // Multipart (file uploads) are handled per-route by multer middleware.
  app.use(express.json({ limit: '64kb' }))
  app.use(express.urlencoded({ extended: false, limit: '64kb' }))

  // ── Health check (unauthenticated) ────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'campus-maintenance-api' })
  })

  // ── API routes ────────────────────────────────────────────
  const api = '/api/v1'
  app.use(`${api}/profile`, profileRoutes)
  app.use(`${api}/reports`, reportRoutes)
  app.use(`${api}/assignments`, assignmentRoutes)
  app.use(`${api}/executions`, executionRoutes)
  app.use(`${api}/master-data`, masterDataRoutes)
  app.use(`${api}/storage`, storageRoutes)
  app.use(`${api}/admin`, adminRoutes)
  app.use(`${api}/notifications`, notificationRoutes)

  // ── 404 and global error handler ─────────────────────────
  app.use(notFound)
  app.use(errorHandler)

  return app
}
