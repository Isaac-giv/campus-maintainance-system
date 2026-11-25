import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchAssignmentHistory } from '../../services/api.js'
import {
  ErrorState,
  PageHeader,
  SearchInput,
  Spinner,
  StatusBadge,
  Table,
  formatDate,
  cx,
} from '../../components/ui/index.jsx'

export default function AssignmentHistoryPage() {
  const { data, loading, error, reload } = useAsync(
    () => fetchAssignmentHistory({ limit: 300 }),
    []
  )
  const [search, setSearch] = useState('')
  const rows = useMemo(() => {
    const q = search.toLowerCase()
    return (data || []).filter(
      (a) =>
        !q ||
        [a.report?.reference_number, a.report?.title, a.technician?.full_name].some((s) =>
          s?.toLowerCase().includes(q)
        )
    )
  }, [data, search])

  return (
    <div>
      <PageHeader
        title="Assignment history"
        subtitle="Every technician assignment and reassignment."
      />
      <SearchInput
        className="mb-4 sm:w-80"
        value={search}
        onChange={setSearch}
        placeholder="Search reference, title, technician…"
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Table
          rows={rows}
          columns={[
            {
              key: 'ref',
              label: 'Complaint',
              render: (a) =>
                a.report && (
                  <div>
                    <Link
                      to={`/supervisor/complaints/${a.report.id}`}
                      className="font-mono text-xs font-semibold text-primary-700 hover:underline"
                    >
                      {a.report.reference_number}
                    </Link>
                    <p className="text-xs text-gray-600">{a.report.title}</p>
                  </div>
                ),
            },
            { key: 'tech', label: 'Technician', render: (a) => a.technician?.full_name },
            {
              key: 'by',
              label: 'Assigned by',
              render: (a) => a.assigner?.full_name || '—',
            },
            {
              key: 'at',
              label: 'Assigned',
              className: 'whitespace-nowrap',
              render: (a) => formatDate(a.assigned_at),
            },
            {
              key: 'acc',
              label: 'Accepted',
              className: 'whitespace-nowrap',
              render: (a) => formatDate(a.accepted_at),
            },
            {
              key: 'st',
              label: 'Assignment',
              render: (a) => (
                <span
                  className={cx(
                    'rounded px-2 py-0.5 text-[11px] font-bold',
                    a.status === 'ACTIVE'
                      ? 'bg-blue-50 text-blue-700'
                      : a.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {a.status}
                </span>
              ),
            },
            {
              key: 'rs',
              label: 'Report status',
              render: (a) => a.report && <StatusBadge status={a.report.status} />,
            },
          ]}
        />
      )}
    </div>
  )
}
