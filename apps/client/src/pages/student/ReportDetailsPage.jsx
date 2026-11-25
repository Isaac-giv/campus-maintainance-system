import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, XCircle } from 'lucide-react'
import { STATUS_LABELS } from '@campus/shared'
import { supabase } from '../../config/supabase.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReport, cancelReport } from '../../services/api.js'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  Spinner,
  cx,
} from '../../components/ui/index.jsx'
import {
  PhotoGallery,
  ReportSummary,
  ReportTimeline,
  ResolutionPanel,
} from '../../components/reports/ReportParts.jsx'

const STEPS = [
  'PENDING',
  'APPROVED',
  'ASSIGNED',
  'IN_PROGRESS',
  'AWAITING_VERIFICATION',
  'RESOLVED',
]
const STEP_INDEX = {
  PENDING: 0,
  APPROVED: 1,
  ASSIGNED: 2,
  ACCEPTED: 2,
  IN_PROGRESS: 3,
  RETURNED: 3,
  AWAITING_VERIFICATION: 4,
  RESOLVED: 5,
}

/** Subscribe to live changes for a single report. */
export function useReportRealtime(id, onChange) {
  useEffect(() => {
    if (!id) return
    const ch = supabase
      .channel(`report-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'maintenance_reports',
          filter: `id=eq.${id}`,
        },
        onChange
      )
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [id, onChange])
}

export function ProgressSteps({ status }) {
  if (['REJECTED', 'CANCELLED'].includes(status)) {
    return (
      <div
        className={cx(
          'rounded-lg p-3 text-sm font-semibold',
          status === 'REJECTED' ? 'bg-red-50 text-red-800' : 'bg-gray-100 text-gray-700'
        )}
      >
        This complaint was {STATUS_LABELS[status].toLowerCase()}.
      </div>
    )
  }
  const current = STEP_INDEX[status] ?? 0
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li
          key={s}
          className="flex min-w-[80px] flex-1 flex-col items-center gap-1 text-center"
        >
          <div
            className={cx(
              'h-1.5 w-full rounded-full',
              i <= current ? 'bg-primary-600' : 'bg-gray-200'
            )}
          />
          <span
            className={cx(
              'text-[11px] leading-tight',
              i === current
                ? 'font-bold text-primary-800'
                : i < current
                  ? 'text-gray-700'
                  : 'text-gray-400'
            )}
          >
            {STATUS_LABELS[s]}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function ReportDetailsPage() {
  const { id } = useParams()
  const toast = useToast()
  const { data: report, loading, error, reload } = useAsync(() => fetchReport(id), [id])
  useReportRealtime(id, reload)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading && !report) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!report)
    return (
      <EmptyState
        title="Report not found"
        message="It may not exist or you may not have access."
        action={
          <Link to="/student/reports" className="btn-primary">
            Back to my reports
          </Link>
        }
      />
    )

  const doCancel = async () => {
    setBusy(true)
    try {
      await cancelReport(report.id, reason)
      toast.success('Complaint cancelled.')
      setCancelOpen(false)
      reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/student/reports"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> My reports
        </Link>
        {['PENDING', 'APPROVED'].includes(report.status) && (
          <Button variant="secondary" onClick={() => setCancelOpen(true)}>
            <XCircle className="mr-1 h-4 w-4" /> Cancel complaint
          </Button>
        )}
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-gray-900">Current status</h2>
        <ProgressSteps status={report.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ReportSummary report={report} />
          <ResolutionPanel report={report} />
          <Card>
            <h2 className="mb-4 text-sm font-bold text-gray-900">
              Progress timeline & updates
            </h2>
            <ReportTimeline report={report} />
          </Card>
        </div>
        <div className="space-y-6">
          <PhotoGallery photos={report.photos} stage="REPORT" title="Your photographs" />
          <PhotoGallery
            photos={report.photos}
            stage="COMPLETION"
            title="Completion photographs"
          />
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel complaint"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Keep
            </Button>
            <Button variant="danger" loading={busy} onClick={doCancel}>
              Cancel complaint
            </Button>
          </>
        }
      >
        <Field label="Reason (optional)">
          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
      </Modal>
    </div>
  )
}
