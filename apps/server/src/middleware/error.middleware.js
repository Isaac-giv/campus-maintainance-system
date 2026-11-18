// apps/server/src/middleware/error.middleware.js
// Global Express error handler. Must be the last middleware registered in app.js.
//
// Handles:
//   • AppError instances (operational errors with known HTTP status codes)
//   • Prisma errors (translated to meaningful HTTP responses)
//   • Unhandled errors (500 responses, full detail in development only)

import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

// Prisma error codes reference:
// https://www.prisma.io/docs/reference/api-reference/error-reference
const PRISMA_NOT_FOUND_CODE = 'P2025'
const PRISMA_UNIQUE_VIOLATION_CODE = 'P2002'
const PRISMA_FK_VIOLATION_CODE = 'P2003'

export function errorHandler(err, req, res, _next) {
  // Operational errors thrown by the application
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
  }

  // Prisma record not found
  if (err?.code === PRISMA_NOT_FOUND_CODE) {
    return res.status(404).json({ success: false, message: 'Resource not found.' })
  }

  // Prisma unique constraint violation
  if (err?.code === PRISMA_UNIQUE_VIOLATION_CODE) {
    return res.status(409).json({
      success: false,
      message: 'A record with this identifier already exists.',
    })
  }

  // Prisma foreign key violation
  if (err?.code === PRISMA_FK_VIOLATION_CODE) {
    return res.status(422).json({
      success: false,
      message:
        'Referenced record does not exist or violates a data integrity constraint.',
    })
  }

  // Unknown / unexpected errors
  console.error('[error]', err)
  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    // Include full error detail in development only — never in production
    ...(env.isDevelopment ? { error: err?.message, stack: err?.stack } : {}),
  })
}
