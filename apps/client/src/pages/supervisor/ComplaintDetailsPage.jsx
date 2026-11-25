import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  UserPlus,
  Repeat,
  SlidersHorizontal,
  RotateCcw,
  ListChecks,
} from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReport } from '../../services/api.js'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Spinner,
} from '../../components/ui/index.jsx'
import {
  AssignmentHistoryList,
  PhotoGallery,
  ReportSummary,
  ReportTimeline,
  ResolutionPanel,
} from '../../components/reports/ReportParts.jsx'
import { ProgressSteps, useReportRealtime } from '../student/ReportDetailsPage.jsx'
import {
  AssignModal,
  CommentBox,
  ReviewModal,
  StatusModal,
  TriageModal,
  VerifyModal,
} from './SupervisorActions.jsx'

const OPEN = [
  'PENDING',
  'APPROVED',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'AWAITING_VERIFICATION',
  'RETURNED',
]

export default function ComplaintDetailsPage() {
  const { id } = useParams()
  const { data: report, loading, error, reload } = useAsync(() => fetchReport(id), [id])
  useReportRealtime(id, reload)
  const [modal, setModal] = useState(null)

  if (loading && !report) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!report)
    return (
      <EmptyState
        title="Complaint not found"
        action={
          <Link to="/supervisor/complaints" className="btn-primary">
            Back
          </Link>
        }
      />
    )

  const s = report.status
  const close = () => setModal(null)
  const props = { report, onClose: close, onDone: reload }

  return (
    <div className="space-y-6">
      <Link
        to="/supervisor/complaints"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> All complaints
      </Link>

      <Card className="space-y-4">
        <ProgressSteps status={s} />
        <div className="flex flex-wrap gap-2 border-t pt-4">
          {s === 'PENDING' && (
            <Button variant="success" onClick={() => setModal('approve')}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
            </Button>
          )}
          {['PENDING', 'APPROVED'].includes(s) && (
            <Button variant="danger" onClick={() => setModal('reject')}>
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          )}
          {['PENDING', 'APPROVED'].includes(s) && (
            <Button onClick={() => setModal('assign')}>
              <UserPlus className="mr-1 h-4 w-4" /> Assign technician
            </Button>
          )}
          {['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RETURNED'].includes(s) && (
            <Button variant="secondary" onClick={() => setModal('assign')}>
              <Repeat className="mr-1 h-4 w-4" /> Reassign
            </Button>
          )}
          {s === 'AWAITING_VERIFICATION' && (
            <>
              <Button variant="success" onClick={() => setModal('verify')}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Approve work & resolve
              </Button>
              <Button variant="danger" onClick={() => setModal('return')}>
                <RotateCcw className="mr-1 h-4 w-4" /> Return for correction
              </Button>
            </>
          )}
          {OPEN.includes(s) && (
            <>
              <Button variant="secondary" onClick={() => setModal('triage')}>
                <SlidersHorizontal className="mr-1 h-4 w-4" /> Categorise / prioritise
              </Button>
              <Button variant="ghost" onClick={() => setModal('status')}>
                <ListChecks className="mr-1 h-4 w-4" /> Update status
              </Button>
            </>
          )}
          {!OPEN.includes(s) && (
            <p className="text-sm text-gray-500">
              This complaint is closed. No further actions are available.
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ReportSummary report={report} />
          <ResolutionPanel report={report} />
          <Card>
            <h2 className="mb-4 text-sm font-bold">Timeline & updates</h2>
            <ReportTimeline report={report} />
            {OPEN.includes(s) && (
              <div className="mt-6 border-t pt-4">
                <CommentBox
                  reportId={report.id}
                  onDone={reload}
                  placeholder="Add a supervisor update (visible to the student unless marked internal)…"
                />
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <PhotoGallery
            photos={report.photos}
            stage="REPORT"
            title="Reported photographs"
          />
          <PhotoGallery
            photos={report.photos}
            stage="COMPLETION"
            title="Completion photographs"
          />
          <Card>
            <h2 className="mb-3 text-sm font-bold">Assignment history</h2>
            <AssignmentHistoryList assignments={report.assignments} />
          </Card>
          {report.student && (
            <Card className="text-sm">
              <h2 className="mb-2 font-bold">Reporter</h2>
              <p className="font-medium">{report.student.full_name}</p>
              <p className="text-gray-600">{report.student.email}</p>
              {report.student.phone && (
                <p className="text-gray-600">{report.student.phone}</p>
              )}
            </Card>
          )}
        </div>
      </div>

      {modal === 'approve' && <ReviewModal {...props} mode="approve" />}
      {modal === 'reject' && <ReviewModal {...props} mode="reject" />}
      {modal === 'assign' && <AssignModal {...props} />}
      {modal === 'triage' && <TriageModal {...props} />}
      {modal === 'verify' && <VerifyModal {...props} mode="approve" />}
      {modal === 'return' && <VerifyModal {...props} mode="return" />}
      {modal === 'status' && <StatusModal {...props} />}
    </div>
  )
}
