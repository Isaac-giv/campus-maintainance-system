import React from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  HardHat,
} from 'lucide-react'
import { STATUS_GROUPS } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports, fetchTechnicians } from '../../services/api.js'
import {
  Card,
  ErrorState,
  PageHeader,
  Spinner,
  StatCard,
  EmptyState,
} from '../../components/ui/index.jsx'
import { ReportTable } from '../../components/reports/ReportParts.jsx'
import { countIn } from '../student/StudentDashboardPage.jsx'

export default function SupervisorDashboardPage() {
  const { profile } = useAuth()
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([fetchReports(), fetchTechnicians()]),
    []
  )

  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const [reports, techs] = data
  const pending = reports.filter((r) => r.status === 'PENDING')
  const awaiting = reports.filter((r) => r.status === 'AWAITING_VERIFICATION')
  const link = (r) => `/supervisor/complaints/${r.id}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile.full_name.split(' ')[0]}`}
        subtitle="Review, prioritise, assign and verify maintenance complaints."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total"
          value={reports.length}
          icon={ClipboardList}
          to="/supervisor/complaints"
        />
        <StatCard
          label="Pending"
          value={countIn(reports, STATUS_GROUPS.PENDING)}
          icon={Clock}
          tone="amber"
          to="/supervisor/complaints?status=PENDING_GROUP"
        />
        <StatCard
          label="Assigned"
          value={countIn(reports, STATUS_GROUPS.ASSIGNED)}
          icon={UserCheck}
          tone="blue"
          to="/supervisor/complaints?status=ASSIGNED"
        />
        <StatCard
          label="In progress"
          value={countIn(reports, STATUS_GROUPS.ACTIVE_WORK)}
          icon={Wrench}
          tone="violet"
          to="/supervisor/complaints?status=IN_PROGRESS"
        />
        <StatCard
          label="Awaiting verification"
          value={awaiting.length}
          icon={ShieldCheck}
          tone="cyan"
          to="/supervisor/verification"
        />
        <StatCard
          label="Resolved"
          value={countIn(reports, STATUS_GROUPS.RESOLVED)}
          icon={CheckCircle2}
          tone="green"
          to="/supervisor/complaints?status=RESOLVED"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">New complaints awaiting review</h2>
              <Link
                to="/supervisor/complaints?status=PENDING"
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <ReportTable
              reports={pending.slice(0, 6)}
              linkTo={link}
              showStudent
              showTechnician={false}
              empty={<EmptyState title="No complaints awaiting review" />}
            />
          </section>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Jobs awaiting verification</h2>
              <Link
                to="/supervisor/verification"
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                Open queue
              </Link>
            </div>
            <ReportTable
              reports={awaiting.slice(0, 5)}
              linkTo={link}
              empty={<EmptyState title="Nothing to verify" />}
            />
          </section>
        </div>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <HardHat className="h-4 w-4" /> Technicians
            </h2>
            <Link
              to="/supervisor/technicians"
              className="text-sm font-medium text-primary-700 hover:underline"
            >
              All
            </Link>
          </div>
          <ul className="divide-y text-sm">
            {techs.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.full_name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {t.specializations.map((s) => s.name).join(', ') ||
                      'No specialization'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${t.staff?.is_available === false ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}
                >
                  {t.activeJobs} active
                </span>
              </li>
            ))}
            {!techs.length && (
              <li className="py-2 text-gray-500">No technicians registered.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
