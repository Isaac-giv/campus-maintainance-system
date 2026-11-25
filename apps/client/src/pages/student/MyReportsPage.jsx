import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import { STATUS_LABELS, STATUS_GROUPS } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports, fetchCategories } from '../../services/api.js'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
} from '../../components/ui/index.jsx'
import { ReportTable } from '../../components/reports/ReportParts.jsx'

export const STATUS_FILTER_OPTIONS = [
  { value: 'PENDING_GROUP', label: 'Pending (all)', statuses: STATUS_GROUPS.PENDING },
  {
    value: 'IN_PROGRESS_GROUP',
    label: 'In progress (all)',
    statuses: STATUS_GROUPS.IN_PROGRESS,
  },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
    statuses: [value],
  })),
]

export default function MyReportsPage() {
  const { profile } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const status = params.get('status') || ''
  const categoryId = params.get('category') || ''

  const {
    data: reports,
    loading,
    error,
    reload,
  } = useAsync(() => fetchReports({ studentId: profile.id }), [profile.id])
  const { data: categories } = useAsync(() => fetchCategories(true), [])

  const setParam = (k) => (v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    if (!reports) return []
    const statuses = STATUS_FILTER_OPTIONS.find((o) => o.value === status)?.statuses
    const q = search.trim().toLowerCase()
    return reports.filter(
      (r) =>
        (!statuses || statuses.includes(r.status)) &&
        (!categoryId || r.category?.id === categoryId) &&
        (!q ||
          [r.title, r.reference_number, r.location_details, r.building?.name].some((s) =>
            s?.toLowerCase().includes(q)
          ))
    )
  }, [reports, status, categoryId, search])

  return (
    <div>
      <PageHeader
        title="My reports"
        subtitle="All maintenance complaints you have submitted."
        actions={
          <Link to="/student/reports/new" className="btn-primary">
            <FilePlus2 className="mr-1 h-4 w-4" /> Report an Issue
          </Link>
        }
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search title, reference, location…"
        />
        <Select
          value={status}
          onChange={setParam('status')}
          placeholder="All statuses"
          options={STATUS_FILTER_OPTIONS}
          aria-label="Filter by status"
        />
        <Select
          value={categoryId}
          onChange={setParam('category')}
          placeholder="All categories"
          options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
          aria-label="Filter by category"
        />
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-500">
            {filtered.length} of {reports.length} reports
          </p>
          <ReportTable
            reports={filtered}
            linkTo={(r) => `/student/reports/${r.id}`}
            empty={
              <EmptyState
                title="No matching reports"
                message="Try changing your search or filters."
              />
            }
          />
        </>
      )}
    </div>
  )
}
