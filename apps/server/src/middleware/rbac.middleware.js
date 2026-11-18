// apps/server/src/middleware/rbac.middleware.js
// Role-Based Access Control middleware factory.
//
// Usage:
//   router.post('/assignments', authenticate, authorize('SUPERVISOR', 'ADMIN'), handler)
//
// The role is taken from req.user.profile.role, which is loaded from the
// protected `profiles` table in the authenticate middleware.
// It is NEVER taken from JWT claims or user-supplied request data.

import { AppError } from '../utils/AppError.js'

/**
 * Returns an Express middleware that allows only the specified roles.
 * Must be used after the `authenticate` middleware.
 *
 * @param {...string} allowedRoles - Role values from the ROLES constant.
 */
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    const userRole = req.user?.profile?.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole ?? 'none'}.`,
          403
        )
      )
    }
    next()
  }
}
