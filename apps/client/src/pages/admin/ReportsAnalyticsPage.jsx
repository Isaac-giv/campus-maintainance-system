import React, { useState } from 'react'
import { Download, Printer, FileText } from 'lucide-react'
import { STATUS_LABELS, PRIORITY_LABELS } from '@campus/shared'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchAnalytics, fetchDepartments, fetchReports } from '../../services/api.js'
import {
  Button,
  Card,
  ErrorState,
  Field,
  PageHeader,
  Select,
  Spinner,
  StatCard,
  Table,
  formatDate,
} from '../../components/ui/index.jsx'
import {
  BarList,
  Donut,
  MonthlyBars,
  STATUS_COLORS,
} from '../../components/charts/Charts.jsx'
import { ReportTable } from '../../components/reports/ReportParts.jsx'

function toCsv(rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return rows.map((r) => r.map(esc).join(',')).join('\r\n')
}

function download(name, content, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\ufeff' + content], { type })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsAnalyticsPage() {
  const toast = useToast()
  const [filters, setFilters] = useState({ from: '', to: '', departmentId: '' })
  const { data: departments } = useAsync(() => fetchDepartments(true), [])
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([fetchAnalytics(filters), fetchReports(filters)]),
    [filters.from, filters.to, filters.departmentId]
  )
  const set = (k) => (v) =>
    setFilters((f) => ({ ...f, [k]: v?.target ? v.target.value : v }))
  const [stats, reports] = data || [null, []]
  const period = `${filters.from || 'start'}_to_${filters.to || 'today'}`

  const exportReports = () => {
    const rows = [
      [
        'Reference',
        'Title',
        'Category',
        'Building',
        'Location',
        'Status',
        'Priority',
        'Student',
        'Technician',
        'Submitted',
        'Resolved',
      ],
    ]
    reports.forEach((r) =>
      rows.push([
        r.reference_number,
        r.title,
        r.category?.name,
        r.building?.name,
        r.location_details,
        STATUS_LABELS[r.status],
        PRIORITY_LABELS[r.priority],
        r.student?.full_name,
        r.technician?.full_name,
        formatDate(r.created_at),
        formatDate(r.resolved_at),
      ])
    )
    download(`maintenance-reports_${period}.csv`, toCsv(rows))
    toast.success(`Exported ${reports.length} reports.`)
  }

  const exportSummary = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Period', period.replace(/_/g, ' ')],
      ['Total reports', stats.total],
      ['Resolved', stats.resolved],
      ['Resolution rate (%)', stats.resolution_rate],
      ['Avg resolution time (h)', stats.avg_resolution_hours ?? ''],
    ]
    rows.push(
      [],
      ['Status', 'Count'],
      ...Object.entries(stats.by_status).map(([k, v]) => [STATUS_LABELS[k], v])
    )
    rows.push(
      [],
      ['Category', 'Count'],
      ...stats.by_category.map((c) => [c.name, c.count])
    )
    rows.push(
      [],
      ['Department', 'Count'],
      ...stats.by_department.map((c) => [c.name, c.count])
    )
    rows.push(
      [],
      [
        'Technician',
        'Assigned',
        'Active',
        'Resolved',
        'Returned',
        'Avg hours to complete',
      ],
      ...stats.technicians.map((t) => [
        t.name,
        t.assigned,
        t.active,
        t.resolved,
        t.returned,
        t.avg_hours ?? '',
      ])
    )
    download(`system-report_${period}.csv`, toCsv(rows))
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <PageHeader
        title="Reports & analytics"
        subtitle="Maintenance performance across campus."
        actions={
          stats && (
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button variant="secondary" onClick={exportReports}>
                <Download className="mr-1 h-4 w-4" /> Export reports (CSV)
              </Button>
              <Button variant="secondary" onClick={exportSummary}>
                <FileText className="mr-1 h-4 w-4" /> System report (CSV)
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-1 h-4 w-4" /> Print / PDF
              </Button>
            </div>
          )
        }
      />
      <Card className="grid gap-3 p-4 sm:grid-cols-4 print:hidden">
        <Field label="From">
          <input
            type="date"
            className="input"
            value={filters.from}
            max={filters.to || undefined}
            onChange={set('from')}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            className="input"
            value={filters.to}
            min={filters.from || undefined}
            onChange={set('to')}
          />
        </Field>
        <Field label="Department">
          <Select
            value={filters.departmentId}
            onChange={set('departmentId')}
            placeholder="All departments"
            options={(departments || []).map((d) => ({ value: d.id, label: d.name }))}
          />
        </Field>
        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={() => setFilters({ from: '', to: '', departmentId: '' })}
          >
            Clear filters
          </Button>
        </div>
      </Card>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total reports" value={stats.total} />
            <StatCard label="Resolved" value={stats.resolved} tone="green" />
            <StatCard
              label="Resolution rate"
              value={`${stats.resolution_rate ?? 0}%`}
              tone="green"
            />
            <StatCard
              label="Avg. resolution time"
              value={
                stats.avg_resolution_hours != null
                  ? `${stats.avg_resolution_hours} h`
                  : '—'
              }
              tone="gray"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-bold">Status breakdown</h2>
              <Donut
                label="Status"
                segments={Object.keys(STATUS_LABELS).map((s) => ({
                  label: STATUS_LABELS[s],
                  value: stats.by_status[s] || 0,
                  color: STATUS_COLORS[s],
                }))}
              />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">Monthly trend</h2>
              <MonthlyBars data={stats.monthly} />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">By category</h2>
              <BarList
                items={stats.by_category.map((c) => ({ label: c.name, value: c.count }))}
              />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">By department</h2>
              <BarList
                color="bg-cyan-600"
                items={stats.by_department.map((c) => ({
                  label: c.name,
                  value: c.count,
                }))}
              />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">By building</h2>
              <BarList
                color="bg-amber-500"
                items={stats.by_building.map((c) => ({ label: c.name, value: c.count }))}
              />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">By priority</h2>
              <BarList
                color="bg-red-500"
                items={Object.keys(PRIORITY_LABELS).map((p) => ({
                  label: PRIORITY_LABELS[p],
                  value: stats.by_priority[p] || 0,
                }))}
              />
            </Card>
          </div>
          <div>
            <h2 className="mb-3 font-bold">Technician performance</h2>
            <Table
              rows={stats.technicians}
              columns={[
                {
                  key: 'name',
                  label: 'Technician',
                  render: (t) => <span className="font-medium">{t.name}</span>,
                },
                { key: 'assigned', label: 'Jobs assigned' },
                { key: 'active', label: 'Active' },
                { key: 'resolved', label: 'Resolved' },
                { key: 'returned', label: 'Returned for correction' },
                {
                  key: 'rate',
                  label: 'Completion rate',
                  render: (t) =>
                    t.assigned ? `${Math.round((t.resolved / t.assigned) * 100)}%` : '—',
                },
                {
                  key: 'avg',
                  label: 'Avg. hours to complete',
                  render: (t) => t.avg_hours ?? '—',
                },
              ]}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold">All maintenance reports ({reports.length})</h2>
            <ReportTable
              reports={reports}
              showStudent
              linkTo={(r) => `/supervisor/complaints/${r.id}`}
            />
          </div>
        </>
      )}
    </div>
  )
}
