// apps/client/src/services/supabaseService.js
// Pure Backend-as-a-Service (BaaS) integration for Cosmopolitan University
// Communicates directly with Supabase Database (PostgREST), Storage, and Realtime.

import { supabase } from '../config/supabase.js'
import { INITIAL_REPORTS } from '../data/mockData.js'

const EVIDENCE_BUCKET = 'maintenance-evidence'

/**
 * Uploads an image file directly to Supabase Storage bucket
 * Returns public URL of uploaded image
 */
export async function uploadEvidencePhoto(file) {
  if (!file) return null

  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `reports/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.warn('[Supabase Storage] Upload fallback or error:', uploadError.message)
      // Return data URL or fallback placeholder for demo
      return URL.createObjectURL(file)
    }

    const { data } = supabase.storage.from(EVIDENCE_BUCKET).getPublicUrl(filePath)
    return data?.publicUrl || URL.createObjectURL(file)
  } catch (err) {
    console.warn('[Supabase Storage] Fallback:', err)
    return URL.createObjectURL(file)
  }
}

/**
 * Fetch all reports from Supabase Database
 * Falls back to in-memory initial reports if Supabase is offline or empty.
 */
export async function fetchReports() {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      // Map database snake_case columns to frontend camelCase
      return data.map((r) => ({
        id: r.id,
        trackingCode: r.tracking_code,
        title: r.title,
        description: r.description,
        category: r.category,
        hostelBlock: r.hostel_block,
        hostelBlockId: r.hostel_block_id,
        roomNumber: r.room_number,
        imageUrl: r.image_url,
        resolutionImageUrl: r.resolution_image_url,
        status: r.status,
        priority: r.priority,
        studentId: r.student_id,
        studentName: r.student_name,
        studentEmail: r.student_email,
        currentWorkerId: r.assigned_worker_id,
        workerName: r.worker_name,
        workerNotes: r.worker_notes,
        supervisorNotes: r.supervisor_notes,
        createdAt: r.created_at,
        resolvedAt: r.resolved_at,
      }))
    }
  } catch {
    console.info(
      '[Supabase BaaS] Using local reports store (Supabase not connected yet).'
    )
  }

  return INITIAL_REPORTS
}

/**
 * Create a new maintenance report in Supabase
 */
export async function createReport(reportData, imageFile) {
  let uploadedImageUrl = reportData.imageUrl || null

  if (imageFile) {
    uploadedImageUrl = await uploadEvidencePhoto(imageFile)
  }

  const trackingCode = `CU-2026-${Math.floor(100000 + Math.random() * 900000)}`

  const payload = {
    tracking_code: trackingCode,
    title: reportData.title,
    description: reportData.description,
    category: reportData.category,
    hostel_block: reportData.hostelBlock,
    hostel_block_id: reportData.hostelBlockId || 'blk-a',
    room_number: reportData.roomNumber,
    image_url: uploadedImageUrl,
    status: 'PENDING',
    priority: reportData.priority || 'MEDIUM',
    student_name: reportData.studentName || 'Student',
    student_email: reportData.studentEmail || '',
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([payload])
      .select()
      .single()

    if (!error && data) {
      return {
        id: data.id,
        trackingCode: data.tracking_code,
        title: data.title,
        description: data.description,
        category: data.category,
        hostelBlock: data.hostel_block,
        roomNumber: data.room_number,
        imageUrl: data.image_url,
        status: data.status,
        priority: data.priority,
        studentName: data.student_name,
        createdAt: data.created_at,
      }
    }
  } catch (err) {
    console.warn('[Supabase BaaS] Report created locally:', err)
  }

  return {
    id: `rep-${Date.now()}`,
    trackingCode,
    ...reportData,
    imageUrl: uploadedImageUrl,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }
}

/**
 * Update report status (Supervisor dispatch, worker execution, or sign-off)
 */
export async function updateReportInDb(id, updates) {
  try {
    const dbUpdates = {}
    if (updates.status) dbUpdates.status = updates.status
    if (updates.priority) dbUpdates.priority = updates.priority
    if (updates.assignedWorkerId) dbUpdates.assigned_worker_id = updates.assignedWorkerId
    if (updates.workerName) dbUpdates.worker_name = updates.workerName
    if (updates.workerNotes) dbUpdates.worker_notes = updates.workerNotes
    if (updates.supervisorNotes) dbUpdates.supervisor_notes = updates.supervisorNotes
    if (updates.resolutionImageUrl)
      dbUpdates.resolution_image_url = updates.resolutionImageUrl
    if (updates.resolvedAt) dbUpdates.resolved_at = updates.resolvedAt
    dbUpdates.updated_at = new Date().toISOString()

    const { error } = await supabase.from('reports').update(dbUpdates).eq('id', id)
    if (error) {
      console.warn('[Supabase BaaS] Update sync notice:', error.message)
    }
  } catch {
    // ignore
  }
}

/**
 * Realtime subscription to live report status changes
 */
export function subscribeToLiveReports(onUpdate) {
  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          if (onUpdate) onUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  } catch {
    return () => {}
  }
}
