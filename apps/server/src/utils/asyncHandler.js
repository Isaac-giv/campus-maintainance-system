// apps/server/src/utils/asyncHandler.js
// Wraps async route handlers to forward thrown errors to Express's next().
// Eliminates the need for try/catch in every controller function.
//
// Usage:
//   router.get('/reports', asyncHandler(async (req, res) => { ... }))

/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
