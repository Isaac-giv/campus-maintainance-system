import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports, fetchReport } from '../../services/api.js'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  PriorityBadge,
  Spinner,
  formatDate,
} from '../../components/ui/index.jsx'
import { VerifyModal } from './SupervisorActions.jsx'

function VerificationCard({ item, onDone }) {
  const { data: report, loading } = useAsync(() => fetchReport(item.id), [item.id])
  const [modal, setModal] = useState(null)
  if (loading || !report)
    return (
      <Card>
        <Spinner />
      </Card>
    )
  const before = report.photos.filter((p) => p.stage === 'REPORT')
  const after = report.photos.filter((p) => p.stage === 'COMPLETION')
  const returns = report.history.filter((h) => h.to_status === 'RETURNED').length

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            to={`/supervisor/complaints/${report.id}`}
            className="font-mono text-xs font-semibold text-primary-700 hover:underline"
          >
            {report.reference_number}
          </Link>
          <h3 className="font-bold text-gray-900">{report.title}</h3>
          <p className="text-xs text-gray-500">
            {report.category?.name} · {report.building?.name} · {report.location_details}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={report.priority} />
          {returns > 0 && (
            <span className="rounded bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
              Returned {returns}×
            </span>
          )}
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 text-sm">
        <p className="text-xs font-semibold uppercase text-gray-500">
          Completion notes — {report.technician?.full_name} ·{' '}
          {formatDate(report.completed_at)}
        </p>
        <p className="mt-1 whitespace-pre-line text-gray-800">
          {report.completion_notes}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['Before (reported)', before],
          ['After (completion)', after],
        ].map(([label, photos]) => (
          <div key={label}>
            <p className="mb-1 text-xs font-semibold text-gray-600">{label}</p>
            <div className="flex flex-wrap gap-2">
              {photos.length ? (
                photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-20 w-20 overflow-hidden rounded border"
                  >
                    <img src={p.url} alt={label} className="h-full w-full object-cover" />
                  </a>
                ))
              ) : (
                <p className="text-xs text-gray-400">No photographs</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button variant="success" onClick={() => setModal('approve')}>
          <CheckCircle2 className="mr-1 h-4 w-4" /> Approve & resolve
        </Button>
        <Button variant="danger" onClick={() => setModal('return')}>
          <RotateCcw className="mr-1 h-4 w-4" /> Return for correction
        </Button>
      </div>
      {modal && (
        <VerifyModal
          report={report}
          mode={modal}
          onClose={() => setModal(null)}
          onDone={onDone}
        />
      )}
    </Card>
  )
}

export default function VerificationQueuePage() {
  const { data, loading, error, reload } = useAsync(
    () => fetchReports({ statuses: ['AWAITING_VERIFICATION'] }),
    []
  )
  return (
    <div>
      <PageHeader
        title="Resolution verification"
        subtitle="Review completed technician jobs before marking complaints as resolved."
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data.length ? (
        <EmptyState
          icon={ShieldCheck}
          title="No jobs awaiting verification"
          message="Completed technician jobs will appear here."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.map((r) => (
            <VerificationCard key={r.id} item={r} onDone={reload} />
          ))}
        </div>
      )}
    </div>
  )
}
