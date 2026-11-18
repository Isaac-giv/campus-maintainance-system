import { z } from 'zod'

/**
 * Schema for signed URL batch request.
 * Express validates this before generating signed URLs for attachments.
 */
export const signedUrlRequestSchema = z.object({
  storagePaths: z
    .array(z.string().min(1))
    .min(1, 'At least one storage path is required')
    .max(20, 'No more than 20 paths per request'),
})
