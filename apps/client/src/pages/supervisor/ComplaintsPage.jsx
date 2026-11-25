import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PRIORITY_LABELS } from '@campus/shared'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports, fetchCategories, fetchBuildings } from '../../services/api.js'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
} from '../../components/ui/index.jsx'
import { ReportTable } from '../../components/reports/ReportParts.jsx'
import { STATUS_FILTER_OPTIONS } from '../student/MyReportsPage.jsx'

export default function ComplaintsPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const f = Object.fromEntries(
    ['status', 'category', 'building', 'priority'].map((k) => [k, params.get(k) || ''])
  )

  const { data: reports, loading, error, reload } = useAsync(() => fetchReports(), [])
  const { data: refs } = useAsync(
    () => Promise.all([fetchCategories(true), fetchBuildings(true)]),
    []
  )
  const [categories, buildings] = refs || [[], []]

  const setParam = (k) => (v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    if (!reports) return []
    const statuses = STATUS_FILTER_OPTIONS.find((o) => o.value === f.status)?.statuses
    const q = search.trim().toLowerCase()
    return reports.filter(
      (r) =>
        (!statuses || statuses.includes(r.status)) &&
        (!f.category || r.category?.id === f.category) &&
        (!f.building || r.building?.id === f.building) &&
        (!f.priority || r.priority === f.priority) &&
        (!q ||
          [r.title, r.reference_number, r.location_details, r.student?.full_name].some(
            (s) => s?.toLowerCase().includes(q)
          ))
    )
  }, [reports, f.status, f.category, f.building, f.priority, search])

  return (
    <div>
      <PageHeader
        title="All complaints"
        subtitle="Every maintenance complaint submitted across campus."
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <SearchInput
          className="lg:col-span-1"
          value={search}
          onChange={setSearch}
          placeholder="Search…"
        />
        <Select
          value={f.status}
          onChange={setParam('status')}
          placeholder="All statuses"
          options={STATUS_FILTER_OPTIONS}
          aria-label="Status"
        />
        <Select
          value={f.category}
          onChange={setParam('category')}
          placeholder="All categories"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          aria-label="Category"
        />
        <Select
          value={f.building}
          onChange={setParam('building')}
          placeholder="All buildings"
          options={buildings.map((b) => ({ value: b.id, label: b.name }))}
          aria-label="Building"
        />
        <Select
          value={f.priority}
          onChange={setParam('priority')}
          placeholder="All priorities"
          options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          aria-label="Priority"
        />
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-500">
            {filtered.length} of {reports.length} complaints
          </p>
          <ReportTable
            reports={filtered}
            showStudent
            linkTo={(r) => `/supervisor/complaints/${r.id}`}
            empty={<EmptyState title="No matching complaints" />}
          />
        </>
      )}
    </div>
  )
}
