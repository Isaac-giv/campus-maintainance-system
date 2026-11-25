// Data access layer. All reads go through RLS-protected tables; all workflow
// writes go through SECURITY DEFINER RPC functions (see supabase/schema.sql).

import { supabase } from '../config/supabase.js'
import { STORAGE_BUCKETS, SIGNED_URL_TTL_SECONDS } from '@campus/shared'

// ── Error handling ────────────────────────────────────────────────────────────

const FRIENDLY = {
  23505: 'A record with these details already exists.',
  23503:
    'This record is linked to other data and cannot be removed. Deactivate it instead.',
  42501: 'You are not authorized to perform this action.',
  PGRST301: 'Your session has expired. Please sign in again.',
}

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

function unwrap({ data, error }) {
  if (error) {
    const custom =
      error.code === 'P0001' ||
      error.code === '22023' ||
      error.code === 'P0002' ||
      error.code === '54000'
    const msg =
      (custom && error.message) ||
      FRIENDLY[error.code] ||
      error.message ||
      'Something went wrong. Please try again.'
    if (import.meta.env.DEV) console.error('[api]', error)
    throw new ApiError(msg, error.code)
  }
  return data
}

const rpc = async (fn, args) => unwrap(await supabase.rpc(fn, args))

// ── Selects ───────────────────────────────────────────────────────────────────

const REPORT_LIST = `
  id, reference_number, title, status, priority, created_at, updated_at, resolved_at,
  location_details, student_id, current_technician_id,
  category:maintenance_categories(id, name, icon, department_id),
  building:buildings(id, name),
  technician:profiles!maintenance_reports_current_technician_id_fkey(id, full_name),
  student:profiles!maintenance_reports_student_id_fkey(id, full_name)
`

const REPORT_DETAIL = `
  *,
  category:maintenance_categories(id, name, icon, department_id),
  building:buildings(id, name),
  location:locations(id, name),
  student:profiles!maintenance_reports_student_id_fkey(id, full_name, email, phone),
  technician:profiles!maintenance_reports_current_technician_id_fkey(id, full_name, phone),
  reviewer:profiles!maintenance_reports_reviewed_by_fkey(id, full_name),
  verifier:profiles!maintenance_reports_verified_by_fkey(id, full_name),
  photos:report_photos(id, stage, storage_path, created_at),
  history:status_history(id, from_status, to_status, note, created_at,
    actor:profiles!status_history_changed_by_fkey(id, full_name, role)),
  updates:report_updates(id, type, message, is_internal, author_role, created_at,
    author:profiles!report_updates_author_id_fkey(id, full_name, role)),
  assignments:technician_assignments(id, status, instructions, assigned_at, accepted_at, ended_at,
    technician:profiles!technician_assignments_technician_id_fkey(id, full_name),
    assigner:profiles!technician_assignments_assigned_by_fkey(id, full_name))
`

// ── Auth & profile ────────────────────────────────────────────────────────────

export async function fetchProfile(userId) {
  return unwrap(
    await supabase
      .from('profiles')
      .select(
        `*, department:departments(id, name),
         student:student_profiles(*, building:buildings(id, name)),
         staff:staff_profiles(*),
         specializations:technician_specializations(specialization:specializations(id, name))`
      )
      .eq('id', userId)
      .single()
  )
}

export const updateMyProfile = (p) =>
  rpc('update_my_profile', {
    p_full_name: p.fullName,
    p_phone: p.phone || null,
    p_avatar_url: p.avatarUrl || null,
    p_programme: p.programme || null,
    p_level: p.level || null,
    p_building_id: p.buildingId || null,
    p_room_number: p.roomNumber || null,
    p_matric_number: p.matricNumber || null,
    p_job_title: p.jobTitle || null,
    p_is_available: p.isAvailable ?? null,
  })

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  unwrap(
    await supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .upload(path, file, { upsert: true })
  )
  return supabase.storage.from(STORAGE_BUCKETS.AVATARS).getPublicUrl(path).data.publicUrl
}

// ── Reference data ────────────────────────────────────────────────────────────

const ref =
  (table, order = 'name') =>
  async (includeInactive = false) => {
    let q = supabase.from(table).select('*').order(order)
    if (!includeInactive) q = q.eq('is_active', true)
    return unwrap(await q)
  }

export const fetchDepartments = ref('departments')
export const fetchBuildings = ref('buildings')
export async function fetchCategories(includeInactive = false) {
  let q = supabase
    .from('maintenance_categories')
    .select(
      '*, department:departments(id, name), specialization:specializations(id, name)'
    )
    .order('name')
  if (!includeInactive) q = q.eq('is_active', true)
  return unwrap(await q)
}
export async function fetchSpecializations(includeInactive = false) {
  let q = supabase
    .from('specializations')
    .select('*, department:departments(id, name)')
    .order('name')
  if (!includeInactive) q = q.eq('is_active', true)
  return unwrap(await q)
}
export async function fetchLocations({ buildingId, includeInactive = false } = {}) {
  let q = supabase
    .from('locations')
    .select('*, building:buildings(id, name)')
    .order('name')
  if (buildingId) q = q.eq('building_id', buildingId)
  if (!includeInactive) q = q.eq('is_active', true)
  return unwrap(await q)
}

// Generic admin CRUD for reference tables (RLS: admin only).
export async function saveRecord(table, record) {
  const { id, ...values } = record
  const q = id
    ? supabase.from(table).update(values).eq('id', id).select().single()
    : supabase.from(table).insert(values).select().single()
  return unwrap(await q)
}
export async function deleteRecord(table, id) {
  return unwrap(await supabase.from(table).delete().eq('id', id))
}

// ── Reports ───────────────────────────────────────────────────────────────────

/**
 * filters: { studentId, technicianId, statuses[], categoryId, buildingId,
 *            departmentId, priority, search, from, to, limit }
 */
export async function fetchReports(filters = {}) {
  const select = filters.departmentId
    ? REPORT_LIST.replace(
        'category:maintenance_categories(',
        'category:maintenance_categories!inner('
      )
    : REPORT_LIST
  let q = supabase
    .from('maintenance_reports')
    .select(select)
    .order('created_at', { ascending: false })
  if (filters.studentId) q = q.eq('student_id', filters.studentId)
  if (filters.technicianId) q = q.eq('current_technician_id', filters.technicianId)
  if (filters.statuses?.length) q = q.in('status', filters.statuses)
  if (filters.categoryId) q = q.eq('category_id', filters.categoryId)
  if (filters.buildingId) q = q.eq('building_id', filters.buildingId)
  if (filters.priority) q = q.eq('priority', filters.priority)
  if (filters.departmentId) q = q.eq('category.department_id', filters.departmentId)
  if (filters.from) q = q.gte('created_at', filters.from)
  if (filters.to) q = q.lt('created_at', nextDay(filters.to))
  if (filters.search) {
    const s = filters.search.replace(/[%,()]/g, ' ').trim()
    if (s)
      q = q.or(
        `title.ilike.%${s}%,reference_number.ilike.%${s}%,location_details.ilike.%${s}%`
      )
  }
  if (filters.limit) q = q.limit(filters.limit)
  return unwrap(await q)
}

function nextDay(dateStr) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export async function fetchReportStatusCounts(filters = {}) {
  let q = supabase.from('maintenance_reports').select('status')
  if (filters.studentId) q = q.eq('student_id', filters.studentId)
  if (filters.technicianId) q = q.eq('current_technician_id', filters.technicianId)
  const rows = unwrap(await q)
  return rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {})
}

export async function fetchReport(id) {
  const report = unwrap(
    await supabase
      .from('maintenance_reports')
      .select(REPORT_DETAIL)
      .eq('id', id)
      .maybeSingle()
  )
  if (!report) return null
  report.history?.sort((a, b) => a.created_at.localeCompare(b.created_at))
  report.updates?.sort((a, b) => a.created_at.localeCompare(b.created_at))
  report.assignments?.sort((a, b) => a.assigned_at.localeCompare(b.assigned_at))
  report.photos = await signPhotos(report.photos || [])
  return report
}

async function signPhotos(photos) {
  if (!photos.length) return []
  const { data } = await supabase.storage
    .from(STORAGE_BUCKETS.REPORT_PHOTOS)
    .createSignedUrls(
      photos.map((p) => p.storage_path),
      SIGNED_URL_TTL_SECONDS
    )
  return photos.map((p, i) => ({ ...p, url: data?.[i]?.signedUrl || null }))
}

/** Upload images to "<uid>/<uuid>.<ext>" and return storage paths. */
export async function uploadPhotos(userId, files) {
  const paths = []
  for (const file of files) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    unwrap(
      await supabase.storage
        .from(STORAGE_BUCKETS.REPORT_PHOTOS)
        .upload(path, file, { contentType: file.type, upsert: false })
    )
    paths.push(path)
  }
  return paths
}

export const submitReport = (r, photoPaths) =>
  rpc('submit_report', {
    p_title: r.title,
    p_description: r.description,
    p_category_id: r.categoryId,
    p_building_id: r.buildingId,
    p_location_details: r.locationDetails,
    p_location_id: r.locationId || null,
    p_photo_paths: photoPaths?.length ? photoPaths : null,
  })

export const cancelReport = (id, reason) =>
  rpc('cancel_report', { p_report_id: id, p_reason: reason || null })

// Supervisor
export const reviewReport = (id, approve, { reason, priority, categoryId } = {}) =>
  rpc('review_report', {
    p_report_id: id,
    p_approve: approve,
    p_reason: reason || null,
    p_priority: priority || null,
    p_category_id: categoryId || null,
  })
export const triageReport = (id, { priority, categoryId }) =>
  rpc('triage_report', {
    p_report_id: id,
    p_priority: priority || null,
    p_category_id: categoryId || null,
  })
export const assignTechnician = (id, technicianId, { instructions, priority } = {}) =>
  rpc('assign_technician', {
    p_report_id: id,
    p_technician_id: technicianId,
    p_instructions: instructions || null,
    p_priority: priority || null,
  })
export const verifyCompletion = (id, approve, feedback) =>
  rpc('verify_completion', {
    p_report_id: id,
    p_approve: approve,
    p_feedback: feedback || null,
  })
export const updateReportStatus = (id, status, note) =>
  rpc('update_report_status', { p_report_id: id, p_status: status, p_note: note || null })

// Technician
export const acceptJob = (id) => rpc('accept_job', { p_report_id: id })
export const startJob = (id) => rpc('start_job', { p_report_id: id })
export const addReportUpdate = (id, message, internal = false) =>
  rpc('add_report_update', { p_report_id: id, p_message: message, p_internal: internal })
export const submitCompletion = (id, notes, photoPaths) =>
  rpc('submit_completion', {
    p_report_id: id,
    p_notes: notes,
    p_photo_paths: photoPaths?.length ? photoPaths : null,
  })

// ── Technicians & assignments ─────────────────────────────────────────────────

export async function fetchTechnicians({ includeInactive = false } = {}) {
  let q = supabase
    .from('profiles')
    .select(
      `id, full_name, email, phone, is_active, department:departments(id, name),
       staff:staff_profiles(is_available, job_title),
       specializations:technician_specializations(specialization:specializations(id, name))`
    )
    .eq('role', 'TECHNICIAN')
    .order('full_name')
  if (!includeInactive) q = q.eq('is_active', true)
  const techs = unwrap(await q)
  const active = unwrap(
    await supabase
      .from('maintenance_reports')
      .select('current_technician_id')
      .in('status', ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RETURNED'])
      .not('current_technician_id', 'is', null)
  )
  const load = active.reduce(
    (m, r) => ({
      ...m,
      [r.current_technician_id]: (m[r.current_technician_id] || 0) + 1,
    }),
    {}
  )
  return techs.map((t) => ({
    ...t,
    specializations: (t.specializations || [])
      .map((s) => s.specialization)
      .filter(Boolean),
    activeJobs: load[t.id] || 0,
  }))
}

export async function fetchAssignmentHistory({ limit = 100 } = {}) {
  return unwrap(
    await supabase
      .from('technician_assignments')
      .select(
        `id, status, instructions, assigned_at, accepted_at, ended_at,
         report:maintenance_reports(id, reference_number, title, status),
         technician:profiles!technician_assignments_technician_id_fkey(id, full_name),
         assigner:profiles!technician_assignments_assigned_by_fkey(id, full_name)`
      )
      .order('assigned_at', { ascending: false })
      .limit(limit)
  )
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotifications(
  userId,
  { limit = 50, unreadOnly = false } = {}
) {
  let q = supabase
    .from('notifications')
    .select('*, report:maintenance_reports(id, reference_number)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (unreadOnly) q = q.eq('is_read', false)
  return unwrap(await q)
}
export async function fetchUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw new ApiError(error.message, error.code)
  return count || 0
}
export const markNotificationRead = (id, read = true) =>
  rpc('mark_notification_read', { p_id: id, p_read: read })
export const markAllNotificationsRead = () => rpc('mark_all_notifications_read')
export const deleteNotification = (id) => deleteRecord('notifications', id)

// ── Administration ────────────────────────────────────────────────────────────

export async function fetchUsers() {
  return unwrap(
    await supabase
      .from('profiles')
      .select(
        `*, department:departments(id, name),
         student:student_profiles(matric_number, building_id, room_number, programme, level),
         staff:staff_profiles(staff_number, job_title, is_available),
         specializations:technician_specializations(specialization_id)`
      )
      .order('created_at', { ascending: false })
  )
}

export const adminUpdateUser = (u) =>
  rpc('admin_update_user', {
    p_user_id: u.id,
    p_full_name: u.fullName,
    p_role: u.role,
    p_department_id: u.departmentId || null,
    p_phone: u.phone || null,
    p_is_active: u.isActive,
    p_staff_number: u.staffNumber || null,
    p_job_title: u.jobTitle || null,
    p_matric_number: u.matricNumber || null,
    p_building_id: u.buildingId || null,
    p_room_number: u.roomNumber || null,
  })
export const adminSetSpecializations = (techId, ids) =>
  rpc('admin_set_specializations', { p_technician_id: techId, p_specialization_ids: ids })
export const adminAssignDepartment = (userIds, departmentId) =>
  rpc('admin_assign_department', { p_user_ids: userIds, p_department_id: departmentId })

/** Calls the admin-users Edge Function (service-role operations). */
async function adminFunction(body) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body })
  if (error) {
    let msg = error.message
    try {
      const ctx = await error.context?.json?.()
      if (ctx?.error) msg = ctx.error
    } catch {
      /* ignore */
    }
    if (/Failed to send|not found|FunctionsFetchError/i.test(msg)) {
      msg = 'The admin-users Edge Function is not deployed. See README > Deployment.'
    }
    throw new ApiError(msg)
  }
  if (data?.error) throw new ApiError(data.error)
  return data
}

export const adminCreateUser = (u) =>
  adminFunction({
    action: 'create',
    ...u,
    redirectTo: `${window.location.origin}/reset-password`,
  })
export const adminSendPasswordReset = (userId) =>
  adminFunction({
    action: 'reset_password',
    userId,
    redirectTo: `${window.location.origin}/reset-password`,
  })
export const adminSetPassword = (userId, password) =>
  adminFunction({ action: 'set_password', userId, password })
export async function adminSetActive(userId, active) {
  try {
    await adminFunction({ action: 'set_active', userId, active })
  } catch (e) {
    // Fall back to profile flag only (blocks all data access via RLS) if the
    // Edge Function is unavailable.
    if (/not deployed/.test(e.message))
      return rpc('admin_set_user_active', { p_user_id: userId, p_active: active })
    throw e
  }
}

export const fetchAnalytics = ({ from, to, departmentId } = {}) =>
  rpc('report_analytics', {
    p_from: from || null,
    p_to: to || null,
    p_department_id: departmentId || null,
  })

export async function fetchActivity(limit = 15) {
  return unwrap(
    await supabase
      .from('activity_log')
      .select('*, actor:profiles!activity_log_actor_id_fkey(full_name, role)')
      .order('created_at', { ascending: false })
      .limit(limit)
  )
}

export async function fetchRecentHistory(limit = 15) {
  return unwrap(
    await supabase
      .from('status_history')
      .select(
        `id, from_status, to_status, note, created_at,
         report:maintenance_reports(id, reference_number, title),
         actor:profiles!status_history_changed_by_fkey(full_name, role)`
      )
      .order('created_at', { ascending: false })
      .limit(limit)
  )
}

export async function fetchUserCounts() {
  const rows = unwrap(await supabase.from('profiles').select('role, is_active'))
  return rows.reduce(
    (acc, r) => {
      acc.total++
      acc[r.role] = (acc[r.role] || 0) + 1
      if (!r.is_active) acc.inactive++
      return acc
    },
    { total: 0, inactive: 0 }
  )
}
