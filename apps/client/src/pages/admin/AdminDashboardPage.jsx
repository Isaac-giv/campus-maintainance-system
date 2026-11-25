import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  ShieldCheck,
  HardHat,
  ClipboardList,
  Activity,
  CheckCircle2,
  Timer,
} from 'lucide-react'
import { STATUS_LABELS, ROLE_LABELS } from '@campus/shared'
import { useAsync } from '../../hooks/useAsync.js'
import {
  fetchUserCounts,
  fetchAnalytics,
  fetchActivity,
  fetchRecentHistory,
} from '../../services/api.js'
import {
  Card,
  ErrorState,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
  timeAgo,
} from '../../components/ui/index.jsx'
import { Donut, STATUS_COLORS } from '../../components/charts/Charts.jsx'

const humanize = (s) =>
  s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        fetchUserCounts(),
        fetchAnalytics(),
        fetchActivity(10),
        fetchRecentHistory(10),
      ]),
    []
  )
  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const [users, stats, activity, history] = data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrator dashboard"
        subtitle="System-wide overview of users, maintenance reports and activity."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.total}
          icon={Users}
          to="/admin/users"
          hint={users.inactive ? `${users.inactive} inactive` : undefined}
        />
        <StatCard
          label="Students"
          value={users.STUDENT || 0}
          icon={GraduationCap}
          tone="blue"
          to="/admin/users?role=STUDENT"
        />
        <StatCard
          label="Supervisors"
          value={users.SUPERVISOR || 0}
          icon={ShieldCheck}
          tone="cyan"
          to="/admin/users?role=SUPERVISOR"
        />
        <StatCard
          label="Technicians"
          value={users.TECHNICIAN || 0}
          icon={HardHat}
          tone="violet"
          to="/admin/users?role=TECHNICIAN"
        />
        <StatCard
          label="Maintenance reports"
          value={stats.total}
          icon={ClipboardList}
          tone="amber"
          to="/admin/reports"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Resolution rate"
          value={`${stats.resolution_rate ?? 0}%`}
          icon={Activity}
          tone="green"
        />
        <StatCard
          label="Avg. resolution time"
          value={
            stats.avg_resolution_hours != null ? `${stats.avg_resolution_hours}h` : '—'
          }
          icon={Timer}
          tone="gray"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold">Maintenance reports by status</h2>
          <Donut
            label="Reports by status"
            segments={Object.keys(STATUS_LABELS).map((s) => ({
              label: STATUS_LABELS[s],
              value: stats.by_status[s] || 0,
              color: STATUS_COLORS[s],
            }))}
          />
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent report activity</h2>
            <Link
              to="/supervisor/complaints"
              className="text-sm font-medium text-primary-700 hover:underline"
            >
              All complaints
            </Link>
          </div>
          <ul className="divide-y text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <Link
                    to={`/supervisor/complaints/${h.report?.id}`}
                    className="font-mono text-xs text-primary-700 hover:underline"
                  >
                    {h.report?.reference_number}
                  </Link>
                  <p className="truncate text-xs text-gray-600">
                    {h.actor?.full_name || 'System'} · {h.note}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={h.to_status} />
                  <span className="text-[10px] text-gray-400">
                    {timeAgo(h.created_at)}
                  </span>
                </div>
              </li>
            ))}
            {!history.length && <li className="py-2 text-gray-500">No activity yet.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-bold">System activity (administration)</h2>
        <ul className="divide-y text-sm">
          {activity.map((a) => (
            <li key={a.id} className="flex justify-between gap-2 py-2">
              <span>
                <strong>{a.actor?.full_name || 'System'}</strong>
                {a.actor?.role && (
                  <span className="text-gray-500"> ({ROLE_LABELS[a.actor.role]})</span>
                )}{' '}
                — {humanize(a.action)} {humanize(a.entity_type)}
                {a.details?.name && (
                  <span className="text-gray-600"> “{a.details.name}”</span>
                )}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {timeAgo(a.created_at)}
              </span>
            </li>
          ))}
          {!activity.length && (
            <li className="py-2 text-gray-500">No administrative activity yet.</li>
          )}
        </ul>
      </Card>
    </div>
  )
}
