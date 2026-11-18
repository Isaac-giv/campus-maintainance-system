import { z } from 'zod'

/**
 * Schema for profile synchronisation on first login.
 * Called by POST /api/v1/profile/sync after Supabase Auth registration.
 * Note: id, email, role, hostel_block_id and room_number are NOT accepted
 * from the client — they are derived server-side.
 */
export const profileSyncSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format')
    .optional(),
})

/**
 * Schema for student self-service profile updates.
 * Only full_name and phone_number are editable by the user.
 * room_number and hostel_block_id require an admin room-allocation operation.
 */
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100)
    .trim()
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format')
    .optional(),
})
