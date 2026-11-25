import React, { useMemo, useState } from 'react'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchTechnicians, fetchSpecializations } from '../../services/api.js'
import {
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
  Table,
} from '../../components/ui/index.jsx'

export default function TechniciansPage() {
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([fetchTechnicians(), fetchSpecializations()]),
    []
  )
  const [search, setSearch] = useState('')
  const [spec, setSpec] = useState('')
  const [techs, specs] = data || [[], []]

  const rows = useMemo(
    () =>
      techs.filter(
        (t) =>
          (!spec || t.specializations.some((s) => s.id === spec)) &&
          (!search || t.full_name.toLowerCase().includes(search.toLowerCase()))
      ),
    [techs, spec, search]
  )

  return (
    <div>
      <PageHeader
        title="Technicians"
        subtitle="Available maintenance technicians, their specializations and current workload."
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:w-2/3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search technicians…"
        />
        <Select
          value={spec}
          onChange={setSpec}
          placeholder="All specializations"
          options={specs.map((s) => ({ value: s.id, label: s.name }))}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Table
          rows={rows}
          columns={[
            {
              key: 'name',
              label: 'Name',
              render: (t) => (
                <div>
                  <p className="font-medium">{t.full_name}</p>
                  <p className="text-xs text-gray-500">{t.email}</p>
                </div>
              ),
            },
            {
              key: 'spec',
              label: 'Specializations',
              render: (t) => (
                <div className="flex flex-wrap gap-1">
                  {t.specializations.length ? (
                    t.specializations.map((s) => (
                      <span
                        key={s.id}
                        className="rounded bg-primary-50 px-2 py-0.5 text-xs text-primary-800"
                      >
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              ),
            },
            {
              key: 'dept',
              label: 'Department',
              render: (t) => t.department?.name || '—',
            },
            { key: 'phone', label: 'Phone', render: (t) => t.phone || '—' },
            {
              key: 'load',
              label: 'Active jobs',
              render: (t) => <span className="font-semibold">{t.activeJobs}</span>,
            },
            {
              key: 'avail',
              label: 'Availability',
              render: (t) =>
                t.staff?.is_available === false ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                    Unavailable
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Available
                  </span>
                ),
            },
          ]}
        />
      )}
    </div>
  )
}
