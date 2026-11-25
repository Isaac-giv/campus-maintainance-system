// Shared domain constants. These values MUST match the PostgreSQL enums in
// supabase/schema.sql (user_role, report_status, report_priority).

export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  SUPERVISOR: 'SUPERVISOR',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN',
})

export const ROLE_LABELS = Object.freeze({
  STUDENT: 'Student',
  SUPERVISOR: 'Supervisor',
  TECHNICIAN: 'Technician',
  ADMIN: 'Administrator',
})

export const ROLE_HOME = Object.freeze({
  STUDENT: '/student',
  SUPERVISOR: '/supervisor',
  TECHNICIAN: '/technician',
  ADMIN: '/admin',
})

export const REPORT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
  RETURNED: 'RETURNED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
})

export const STATUS_LABELS = Object.freeze({
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  AWAITING_VERIFICATION: 'Awaiting Verification',
  RETURNED: 'Returned for Correction',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
})

/** Groupings used by dashboards. */
export const STATUS_GROUPS = Object.freeze({
  PENDING: ['PENDING', 'APPROVED'],
  ASSIGNED: ['ASSIGNED', 'ACCEPTED'],
  IN_PROGRESS: [
    'ASSIGNED',
    'ACCEPTED',
    'IN_PROGRESS',
    'AWAITING_VERIFICATION',
    'RETURNED',
  ],
  ACTIVE_WORK: ['IN_PROGRESS', 'RETURNED'],
  RESOLVED: ['RESOLVED'],
  CLOSED: ['RESOLVED', 'REJECTED', 'CANCELLED'],
})

/** Mirrors public._is_valid_transition() in the database. */
export const VALID_TRANSITIONS = Object.freeze({
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED', 'ASSIGNED'],
  APPROVED: ['ASSIGNED', 'REJECTED', 'CANCELLED'],
  ASSIGNED: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'],
  ACCEPTED: ['ASSIGNED', 'IN_PROGRESS'],
  IN_PROGRESS: ['ASSIGNED', 'AWAITING_VERIFICATION'],
  AWAITING_VERIFICATION: ['RESOLVED', 'RETURNED'],
  RETURNED: ['IN_PROGRESS', 'ASSIGNED'],
  RESOLVED: [],
  REJECTED: [],
  CANCELLED: [],
})

export const canTransition = (from, to) => (VALID_TRANSITIONS[from] || []).includes(to)

export const PRIORITY = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
})

export const PRIORITY_LABELS = Object.freeze({
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
})

export const STORAGE_BUCKETS = Object.freeze({
  REPORT_PHOTOS: 'report-photos',
  AVATARS: 'avatars',
})

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_PHOTOS = 5
export const ALLOWED_MIME_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp'])
export const SIGNED_URL_TTL_SECONDS = 3600

export const BUILDING_TYPES = Object.freeze([
  'ACADEMIC',
  'HOSTEL',
  'ADMINISTRATIVE',
  'SPORTS',
  'OTHER',
])
export const LOCATION_TYPES = Object.freeze(['ROOM', 'FACILITY', 'AREA'])
