import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Play,
  Send,
  RotateCcw,
  MapPin,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  fetchReport,
  acceptJob,
  startJob,
  submitCompletion,
  uploadPhotos,
} from '../../services/api.js'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Spinner,
  formatDate,
} from '../../components/ui/index.jsx'
import {
  PhotoGallery,
  PhotoPicker,
  ReportSummary,
  ReportTimeline,
  ResolutionPanel,
} from '../../components/reports/ReportParts.jsx'
import { ProgressSteps, useReportRealtime } from '../student/ReportDetailsPage.jsx'
import { CommentBox } from '../supervisor/SupervisorActions.jsx'

export default function JobDetailsPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const toast = useToast()
  const { data: report, loading, error, reload } = useAsync(() => fetchReport(id), [id])
  useReportRealtime(id, reload)
  const [busy, setBusy] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState([])
  const [notesErr, setNotesErr] = useState('')

  if (loading && !report) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!report)
    return (
      <EmptyState
        title="Job not found"
        action={
          <Link to="/technician/jobs" className="btn-primary">
            Back to jobs
          </Link>
        }
      />
    )

  const mine = report.current_technician_id === profile.id
  const s = report.status
  const activeAssignment = report.assignments?.find(
    (a) => a.status === 'ACTIVE' && a.technician?.id === profile.id
  )
  const feedback = (report.updates || []).filter(
    (u) =>
      ['FEEDBACK', 'REVIEW', 'COMMENT', 'ASSIGNMENT'].includes(u.type) &&
      u.author?.role !== 'TECHNICIAN'
  )

  const act = async (key, fn, msg) => {
    setBusy(key)
    try {
      await fn()
      toast.success(msg)
      setConfirm(null)
      reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const submit = async () => {
    if (notes.trim().length < 10) {
      setNotesErr('Describe the work done (at least 10 characters).')
      return
    }
    await act(
      'submit',
      async () => {
        const paths = photos.length ? await uploadPhotos(profile.id, photos) : []
        await submitCompletion(report.id, notes, paths)
        setNotes('')
        setPhotos([])
      },
      'Job submitted for supervisor verification.'
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/technician/jobs"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> My jobs
      </Link>

      {!mine && (
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-sm text-gray-700">
          This job is no longer assigned to you. It is shown for reference only.
        </div>
      )}

      <Card className="space-y-4">
        <ProgressSteps status={s} />
        {mine && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {s === 'ASSIGNED' && (
              <Button
                variant="success"
                loading={busy === 'accept'}
                onClick={() => act('accept', () => acceptJob(report.id), 'Job accepted.')}
              >
                <Check className="mr-1 h-4 w-4" /> Accept job
              </Button>
            )}
            {['ASSIGNED', 'ACCEPTED'].includes(s) && (
              <Button onClick={() => setConfirm('start')}>
                <Play className="mr-1 h-4 w-4" /> Start maintenance work
              </Button>
            )}
            {s === 'RETURNED' && (
              <Button onClick={() => setConfirm('start')}>
                <RotateCcw className="mr-1 h-4 w-4" /> Start rework
              </Button>
            )}
            {s === 'AWAITING_VERIFICATION' && (
              <p className="text-sm text-cyan-800">
                Submitted {formatDate(report.completed_at)}. Waiting for supervisor
                verification.
              </p>
            )}
            {s === 'RESOLVED' && (
              <p className="text-sm text-emerald-700">
                Verified and resolved {formatDate(report.resolved_at)}.
              </p>
            )}
          </div>
        )}
      </Card>

      {activeAssignment?.instructions && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="text-xs font-bold uppercase">Supervisor instructions</p>
          <p className="mt-1">{activeAssignment.instructions}</p>
        </div>
      )}

      {s === 'RETURNED' && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <p className="text-xs font-bold uppercase">Returned for correction</p>
          <p className="mt-1">
            {[...report.history].reverse().find((h) => h.to_status === 'RETURNED')?.note}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ReportSummary report={report} />

          {mine && s === 'IN_PROGRESS' && (
            <Card className="space-y-4 border-primary-200">
              <h2 className="font-bold">Complete job</h2>
              <Field
                label="Completion notes"
                required
                error={notesErr}
                hint="What was the cause, what did you fix, and what materials were used?"
              >
                <textarea
                  className="input"
                  rows={5}
                  maxLength={2000}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    setNotesErr('')
                  }}
                />
              </Field>
              <PhotoPicker
                files={photos}
                onChange={setPhotos}
                label="Completion photographs"
              />
              <Button loading={busy === 'submit'} onClick={submit}>
                <Send className="mr-1 h-4 w-4" /> Submit for verification
              </Button>
            </Card>
          )}

          <ResolutionPanel report={report} />

          <Card>
            <h2 className="mb-4 text-sm font-bold">Timeline & work progress</h2>
            <ReportTimeline report={report} />
            {mine && ['ACCEPTED', 'IN_PROGRESS', 'RETURNED'].includes(s) && (
              <div className="mt-6 border-t pt-4">
                <p className="mb-2 text-sm font-medium">Record work progress</p>
                <CommentBox
                  reportId={report.id}
                  onDone={reload}
                  allowInternal
                  placeholder="e.g. Replaced faulty valve; waiting on spare part for the cistern…"
                />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="text-sm">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <MapPin className="h-4 w-4" /> Issue location
            </h2>
            <p className="font-medium">{report.building?.name}</p>
            {report.location && <p className="text-gray-700">{report.location.name}</p>}
            <p className="text-gray-700">{report.location_details}</p>
          </Card>
          <PhotoGallery
            photos={report.photos}
            stage="REPORT"
            title="Reported photographs"
          />
          <PhotoGallery
            photos={report.photos}
            stage="COMPLETION"
            title="My completion photographs"
          />
          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <MessageSquare className="h-4 w-4" /> Supervisor feedback
            </h2>
            {feedback.length ? (
              <ul className="space-y-2 text-sm">
                {feedback.map((f) => (
                  <li key={f.id} className="rounded-lg bg-gray-50 p-2">
                    <p className="text-gray-800">{f.message}</p>
                    <p className="text-xs text-gray-500">
                      {f.author?.full_name} · {formatDate(f.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No feedback yet.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'start'}
        title={s === 'RETURNED' ? 'Start rework' : 'Start maintenance work'}
        message="The student will be notified that work has begun."
        confirmLabel="Start"
        loading={busy === 'start'}
        onClose={() => setConfirm(null)}
        onConfirm={() => act('start', () => startJob(report.id), 'Work started.')}
      />
    </div>
  )
}
