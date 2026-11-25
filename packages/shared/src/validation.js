// Client-side validation helpers. The database RPC functions re-validate every
// rule server-side; these exist for immediate user feedback.

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, MAX_PHOTOS } from './constants/index.js'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/

const len = (v) => (v || '').trim().length

export function validateReport(form) {
  const e = {}
  if (!form.categoryId) e.categoryId = 'Select a maintenance category.'
  if (!form.buildingId) e.buildingId = 'Select a building.'
  if (len(form.locationDetails) < 1)
    e.locationDetails = 'Enter the room or specific location.'
  else if (len(form.locationDetails) > 300) e.locationDetails = 'Maximum 300 characters.'
  if (len(form.title) < 5) e.title = 'Title must be at least 5 characters.'
  else if (len(form.title) > 150) e.title = 'Title must not exceed 150 characters.'
  if (len(form.description) < 10)
    e.description = 'Description must be at least 10 characters.'
  else if (len(form.description) > 2000)
    e.description = 'Description must not exceed 2000 characters.'
  const photoError = validatePhotos(form.photos || [])
  if (photoError) e.photos = photoError
  return e
}

export function validatePhotos(files) {
  if (files.length > MAX_PHOTOS)
    return `You can attach at most ${MAX_PHOTOS} photographs.`
  for (const f of files) {
    if (!ALLOWED_MIME_TYPES.includes(f.type))
      return `${f.name}: only JPEG, PNG or WEBP images are allowed.`
    if (f.size > MAX_FILE_SIZE_BYTES) return `${f.name}: file exceeds 5 MB.`
  }
  return null
}

export function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw))
    return 'Password must contain letters and numbers.'
  return null
}

export function validateRegistration(form) {
  const e = {}
  if (len(form.fullName) < 2) e.fullName = 'Enter your full name.'
  if (!EMAIL_RE.test((form.email || '').trim())) e.email = 'Enter a valid email address.'
  if (len(form.matricNumber) < 3) e.matricNumber = 'Enter your matriculation number.'
  const pw = validatePassword(form.password)
  if (pw) e.password = pw
  if (form.password !== form.confirmPassword)
    e.confirmPassword = 'Passwords do not match.'
  if (form.phone && !PHONE_RE.test(form.phone.trim())) e.phone = 'Invalid phone number.'
  return e
}
