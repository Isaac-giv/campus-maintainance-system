// apps/server/src/middleware/auth.middleware.js
// Verifies the Supabase-issued Bearer JWT on every protected request.
//
// Flow:
//   1. Extract Bearer token from Authorization header.
//   2. Verify token with Supabase Admin SDK (GoTrue /auth/v1/user).
//   3. Load the caller's authoritative profile (role, hostel allocation)
//      from the campus_app Prisma connection — NOT from JWT metadata.
//   4. Attach { supabaseUser, profile } to req.user for downstream use.
//
// Why we load the profile from the database rather than trusting JWT claims:
//   Application roles (STUDENT, SUPERVISOR, WORKER, ADMIN) are stored in the
//   protected `profiles` table. User-editable auth metadata is never trusted
//   for authorisation decisions. See Phase 1.4 Output A.

import supabaseAdmin from '../config/supabaseAdmin.js'
import prisma from '../config/prisma.js'
import { AppError } from '../utils/AppError.js'

export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or malformed Authorization header', 401)
    }

    const token = authHeader.slice(7)

    // Verify token with Supabase GoTrue
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) {
      throw new AppError('Invalid or expired access token', 401)
    }

    const supabaseUser = data.user

    // Load authoritative profile from database via campus_app role
    const profile = await prisma.profile.findUnique({
      where: { id: supabaseUser.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        hostelBlockId: true,
        roomNumber: true,
        isActive: true,
      },
    })

    if (!profile) {
      throw new AppError(
        'User profile not found. Please complete registration by calling POST /api/v1/profile/sync.',
        403
      )
    }

    if (!profile.isActive) {
      throw new AppError(
        'Your account has been deactivated. Contact administration.',
        403
      )
    }

    req.user = { supabaseUser, profile }
    next()
  } catch (err) {
    next(err)
  }
}
