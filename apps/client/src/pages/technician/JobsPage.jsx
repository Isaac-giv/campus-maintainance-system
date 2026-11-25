import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports } from '../../services/api.js'
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  PriorityBadge,
  SearchInput,
  Spinner,
  StatusBadge,
  cx,
  timeAgo,
} from '../../components/ui/index.jsx'

export function JobCard({ job }) {
  return (
    <Link to={`/technician/jobs/${job.id}`}>
      <Card
        className={cx(
          'h-full space-y-2 p-4 transition hover:shadow-md',
          job.status === 'RETURNED' && 'border-orange-300',
          job.priority === 'URGENT' && 'border-l-4 border-l-red-500'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-primary-700">
            {job.reference_number}
          </span>
          <PriorityBadge priority={job.priority} />
        </div>
        <p className="font-semibold text-gray-900">{job.title}</p>
        <p className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          {job.building?.name} — {job.location_details}
        </p>
        <div className="flex items-center justify-between pt-1">
          <StatusBadge status={job.status} />
          <span className="text-xs text-gray-500">
            {job.category?.name} · {timeAgo(job.updated_at)}
          </span>
        </div>
      </Card>
    </Link>
  )
}

const TABS = {
  all: {
    label: 'All active',
    statuses: [
      'ASSIGNED',
      'ACCEPTED',
      'IN_PROGRESS',
      'RETURNED',
      'AWAITING_VERIFICATION',
    ],
  },
  pending: { label: 'Pending', statuses: ['ASSIGNED', 'ACCEPTED'] },
  in_progress: { label: 'In progress', statuses: ['IN_PROGRESS'] },
  returned: { label: 'Returned', statuses: ['RETURNED'] },
  submitted: { label: 'Awaiting verification', statuses: ['AWAITING_VERIFICATION'] },
}

export default function JobsPage() {
  const { profile } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'all'
  const [search, setSearch] = useState('')
  const {
    data: jobs,
    loading,
    error,
    reload,
  } = useAsync(() => fetchReports({ technicianId: profile.id }), [profile.id])

  const list = useMemo(() => {
    const q = search.toLowerCase()
    const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return (jobs || [])
      .filter((j) => TABS[tab].statuses.includes(j.status))
      .filter(
        (j) =>
          !q ||
          [j.title, j.reference_number, j.location_details, j.building?.name].some((s) =>
            s?.toLowerCase().includes(q)
          )
      )
      .sort(
        (a, b) =>
          order[a.priority] - order[b.priority] ||
          b.created_at.localeCompare(a.created_at)
      )
  }, [jobs, tab, search])

  return (
    <div>
      <PageHeader
        title="My jobs"
        subtitle="Maintenance jobs assigned to you, sorted by priority."
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg border bg-white p-1 text-sm">
          {Object.entries(TABS).map(([k, t]) => {
            const n = (jobs || []).filter((j) => t.statuses.includes(j.status)).length
            return (
              <button
                key={k}
                onClick={() =>
                  setParams(k === 'all' ? {} : { tab: k }, { replace: true })
                }
                className={cx(
                  'whitespace-nowrap rounded-md px-3 py-1.5 font-medium',
                  tab === k
                    ? 'bg-primary-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {t.label} <span className="opacity-70">({n})</span>
              </button>
            )
          })}
        </div>
        <SearchInput
          className="sm:w-64"
          value={search}
          onChange={setSearch}
          placeholder="Search jobs…"
        />
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : list.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Briefcase} title="No jobs in this view" />
      )}
    </div>
  )
}
