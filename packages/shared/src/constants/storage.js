/**
 * Supabase Storage bucket names and upload constraints.
 * Bucket names must match what is provisioned in the Supabase project.
 */
export const STORAGE_BUCKETS = /** @type {const} */ ({
  REPORT_PHOTOS: 'report-photos',
  RESOLUTION_EVIDENCE: 'resolution-evidence',
})

/** Maximum file upload size: 5 MB in bytes */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5,242,880

/**
 * Allowed MIME types for image uploads.
 * Both Express and storage bucket policies enforce this list.
 */
export const ALLOWED_MIME_TYPES = /** @type {const} */ ([
  'image/jpeg',
  'image/png',
  'image/webp',
])

/**
 * Storage path stage segments.
 * Must match the stage used when building storage paths in the server.
 */
export const STORAGE_STAGES = /** @type {const} */ ({
  INITIAL: 'initial',
  RESOLUTION: 'resolution',
})

/** Signed URL TTL in seconds (15 minutes) */
export const SIGNED_URL_TTL_SECONDS = 900

/**
 * Magic byte signatures used to verify actual image format.
 * Express reads the first 16 bytes of each upload and matches against these.
 */
export const IMAGE_MAGIC_BYTES = {
  /** JPEG: starts with FF D8 FF */
  JPEG: [0xff, 0xd8, 0xff],
  /** PNG: starts with 89 50 4E 47 0D 0A 1A 0A */
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  /**
   * WEBP: bytes 0–3 = RIFF, bytes 8–11 = WEBP.
   * Validation checks both signatures separately.
   */
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46],
  WEBP_MARKER: [0x57, 0x45, 0x42, 0x50],
}
