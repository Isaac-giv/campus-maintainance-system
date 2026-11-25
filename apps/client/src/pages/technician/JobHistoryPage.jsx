import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports } from '../../services/api.js'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Spinner,
  StatusBadge,
  Table,
  formatDate,
} from '../../components/ui/index.jsx'

export default function JobHistoryPage() {
  const { profile } = useAuth()
  const { data, loading, error, reload } = useAsync(
    () =>
      fetchReports({
        technicianId: profile.id,
        statuses: ['AWAITING_VERIFICATION', 'RESOLVED', 'CANCELLED'],
      }),
    [profile.id]
  )
  const [search, setSearch] = useState('')
  const rows = useMemo(() => {
    const q = search.toLowerCase()
    return (data || []).filter(
      (r) =>
        !q ||
        [r.title, r.reference_number, r.building?.name].some((s) =>
          s?.toLowerCase().includes(q)
        )
    )
  }, [data, search])

  return (
    <div>
      <PageHeader
        title="Completed job history"
        subtitle="Jobs you have completed and submitted."
      />
      <SearchInput
        className="mb-4 sm:w-80"
        value={search}
        onChange={setSearch}
        placeholder="Search history…"
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Table
          rows={rows}
          empty={<EmptyState title="No completed jobs yet" />}
          columns={[
            {
              key: 'ref',
              label: 'Reference',
              render: (r) => (
                <Link
                  to={`/technician/jobs/${r.id}`}
                  className="font-mono text-xs font-semibold text-primary-700 hover:underline"
                >
                  {r.reference_number}
                </Link>
              ),
            },
            {
              key: 'title',
              label: 'Job',
              render: (r) => (
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-gray-500">
                    {r.category?.name} · {r.building?.name}
                  </p>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: 'res',
              label: 'Resolved',
              className: 'whitespace-nowrap',
              render: (r) => formatDate(r.resolved_at),
            },
          ]}
        />
      )}
    </div>
  )
}
