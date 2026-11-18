// apps/server/src/middleware/notFound.middleware.js
// Catches any request that did not match a registered route and returns 404.

import { AppError } from '../utils/AppError.js'

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
}
