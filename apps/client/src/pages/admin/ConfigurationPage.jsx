import React, { useState } from 'react'
import { BUILDING_TYPES, LOCATION_TYPES } from '@campus/shared'
import { useAsync } from '../../hooks/useAsync.js'
import {
  fetchCategories,
  fetchBuildings,
  fetchLocations,
  fetchDepartments,
  fetchSpecializations,
} from '../../services/api.js'
import {
  ErrorState,
  PageHeader,
  Select,
  Spinner,
  cx,
} from '../../components/ui/index.jsx'
import CrudSection from './CrudSection.jsx'

const TABS = [
  ['categories', 'Maintenance categories'],
  ['buildings', 'Campus buildings'],
  ['locations', 'Locations & facilities'],
]
const ICONS = [
  'Wrench',
  'Droplets',
  'Zap',
  'Armchair',
  'Wind',
  'Wifi',
  'Building2',
  'Trash2',
  'Hammer',
  'Lightbulb',
  'ShieldAlert',
]
const title = (s) => s.charAt(0) + s.slice(1).toLowerCase()

export default function ConfigurationPage() {
  const [tab, setTab] = useState('categories')
  const [buildingFilter, setBuildingFilter] = useState('')
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        fetchCategories(true),
        fetchBuildings(true),
        fetchLocations({ includeInactive: true }),
        fetchDepartments(),
        fetchSpecializations(),
      ]),
    []
  )
  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const [categories, buildings, locations, departments, specializations] = data
  const buildingOptions = buildings.map((b) => ({ value: b.id, label: b.name }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance configuration"
        subtitle="Manage categories, buildings and facilities used in complaint forms."
      />
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-white p-1 text-sm">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cx(
              'whitespace-nowrap rounded-md px-3 py-1.5 font-medium',
              tab === k ? 'bg-primary-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <CrudSection
          title="Maintenance categories"
          description="Inactive categories are hidden from the report form but kept on existing reports."
          table="maintenance_categories"
          rows={categories}
          onChanged={reload}
          defaults={{ icon: 'Wrench' }}
          fields={[
            { key: 'name', label: 'Name', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            {
              key: 'icon',
              label: 'Icon',
              type: 'select',
              placeholder: undefined,
              options: ICONS.map((i) => ({ value: i, label: i })),
            },
            {
              key: 'department_id',
              label: 'Responsible department',
              type: 'select',
              options: departments.map((d) => ({ value: d.id, label: d.name })),
            },
            {
              key: 'specialization_id',
              label: 'Required specialization',
              type: 'select',
              options: specializations.map((s) => ({ value: s.id, label: s.name })),
            },
          ]}
          columns={[
            {
              key: 'name',
              label: 'Category',
              render: (c) => (
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.description}</p>
                </div>
              ),
            },
            {
              key: 'dept',
              label: 'Department',
              render: (c) => c.department?.name || '—',
            },
            {
              key: 'spec',
              label: 'Specialization',
              render: (c) => c.specialization?.name || '—',
            },
          ]}
        />
      )}

      {tab === 'buildings' && (
        <CrudSection
          title="Campus buildings"
          table="buildings"
          rows={buildings}
          onChanged={reload}
          defaults={{ type: 'ACADEMIC' }}
          fields={[
            { key: 'name', label: 'Name', required: true },
            { key: 'code', label: 'Code' },
            {
              key: 'type',
              label: 'Type',
              type: 'select',
              placeholder: undefined,
              options: BUILDING_TYPES.map((t) => ({ value: t, label: title(t) })),
            },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            {
              key: 'name',
              label: 'Building',
              render: (b) => <span className="font-medium">{b.name}</span>,
            },
            { key: 'code', label: 'Code' },
            { key: 'type', label: 'Type', render: (b) => title(b.type) },
            {
              key: 'locs',
              label: 'Locations',
              render: (b) => locations.filter((l) => l.building_id === b.id).length,
            },
          ]}
        />
      )}

      {tab === 'locations' && (
        <>
          <Select
            className="sm:w-72"
            value={buildingFilter}
            onChange={setBuildingFilter}
            placeholder="All buildings"
            options={buildingOptions}
          />
          <CrudSection
            title="Locations & facilities"
            description="Rooms, facilities and areas students can pick when reporting."
            table="locations"
            rows={locations.filter(
              (l) => !buildingFilter || l.building_id === buildingFilter
            )}
            onChanged={reload}
            defaults={{ type: 'ROOM', building_id: buildingFilter || '' }}
            fields={[
              {
                key: 'building_id',
                label: 'Building',
                type: 'select',
                required: true,
                placeholder: 'Select building',
                options: buildingOptions,
              },
              {
                key: 'name',
                label: 'Name',
                required: true,
                placeholder: 'e.g. Room 101 / Chemistry Lab',
              },
              {
                key: 'type',
                label: 'Type',
                type: 'select',
                placeholder: undefined,
                options: LOCATION_TYPES.map((t) => ({ value: t, label: title(t) })),
              },
              { key: 'floor', label: 'Floor' },
            ]}
            columns={[
              {
                key: 'name',
                label: 'Location',
                render: (l) => <span className="font-medium">{l.name}</span>,
              },
              { key: 'b', label: 'Building', render: (l) => l.building?.name },
              { key: 'type', label: 'Type', render: (l) => title(l.type) },
              { key: 'floor', label: 'Floor', render: (l) => l.floor || '—' },
            ]}
          />
        </>
      )}
    </div>
  )
}
