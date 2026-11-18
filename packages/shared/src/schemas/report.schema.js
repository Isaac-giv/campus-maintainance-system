import { z } from 'zod'
import { PRIORITY, ROLES } from '../constants/index.js'

/**
 * Schema for student report submission.
 * hostel_block_id, room_id, and student_id are intentionally excluded —
 * the server derives them from the authenticated student's profile record.
 */
export const createReportSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(5, 'Title must be at least 5 characters')
      .max(150, 'Title must not exceed 150 characters')
      .trim(),
    description: z
      .string({ required_error: 'Description is required' })
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must not exceed 2000 characters')
      .trim(),
    categoryId: z
      .string({ required_error: 'Issue category is required' })
      .uuid('Category ID must be a valid UUID'),
    specificLocationDetails: z
      .string({ required_error: 'Location details are required' })
      .min(3, 'Please provide more specific location details')
      .max(300)
      .trim(),
    // These fields must NOT be supplied by students — rejected by Zod
    hostelBlockId: z.never({ message: 'hostelBlockId must not be supplied' }).optional(),
    roomId: z.never({ message: 'roomId must not be supplied' }).optional(),
    studentId: z.never({ message: 'studentId must not be supplied' }).optional(),
  })
  .strict()

/**
 * Schema for student cancellation of their own PENDING report.
 */
export const cancelReportSchema = z.object({
  reason: z.string().max(500).trim().optional(),
})

/**
 * Schema for supervisor/admin assignment of a worker to a report.
 */
export const assignReportSchema = z.object({
  workerId: z
    .string({ required_error: 'Worker ID is required' })
    .uuid('Worker ID must be a valid UUID'),
  priority: z
    .enum(Object.values(PRIORITY), {
      errorMap: () => ({ message: 'Invalid priority level' }),
    })
    .optional(),
  instructions: z.string().max(500).trim().optional(),
})

/**
 * Schema for worker job completion submission.
 * Evidence file upload is handled separately via multipart middleware.
 */
export const completeJobSchema = z.object({
  workerNotes: z
    .string({ required_error: 'Completion notes are required' })
    .min(10, 'Please provide at least 10 characters describing the work done')
    .max(2000)
    .trim(),
})

/**
 * Schema for supervisor verification (sign-off).
 */
export const verifyReportSchema = z.object({
  supervisorNotes: z
    .string({ required_error: 'Verification notes are required' })
    .min(5, 'Please provide verification notes')
    .max(1000)
    .trim(),
})

/**
 * Schema for supervisor rejection of deficient work.
 */
export const rejectReportSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'Rejection reason is required' })
    .min(10, 'Please explain why the work is being rejected')
    .max(1000)
    .trim(),
})

/**
 * Schema for admin role-change operation.
 * Only valid target roles can be set via this endpoint.
 */
export const changeRoleSchema = z.object({
  role: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
})

/**
 * Schema for admin room allocation.
 */
export const roomAllocationSchema = z.object({
  hostelBlockId: z
    .string({ required_error: 'Hostel block ID is required' })
    .uuid('Hostel block ID must be a valid UUID'),
  roomNumber: z
    .string({ required_error: 'Room number is required' })
    .min(1)
    .max(10)
    .trim(),
})
