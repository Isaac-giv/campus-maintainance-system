// apps/server/src/middleware/validate.middleware.js
// Zod request validation middleware factory.
//
// Usage:
//   router.post('/reports', authenticate, validate(createReportSchema), handler)
//
// Validates req.body against the provided Zod schema.
// Returns 400 with structured field errors on validation failure.
// On success, replaces req.body with the parsed (and coerced) Zod output.

import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

/**
 * @param {import('zod').ZodTypeAny} schema - Zod schema to validate req.body against.
 */
export function validate(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        return next(new AppError('Validation failed', 400, details))
      }
      next(err)
    }
  }
}
