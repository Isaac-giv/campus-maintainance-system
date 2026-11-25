import React from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, Wrench, CheckCircle2, RotateCcw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports } from '../../services/api.js'
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  StatCard,
} from '../../components/ui/index.jsx'
import { JobCard } from './JobsPage.jsx'

export const ACTIVE_JOB = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RETURNED']

export default function TechnicianDashboardPage() {
  const { profile } = useAuth()
  const {
    data: jobs,
    loading,
    error,
    reload,
  } = useAsync(() => fetchReports({ technicianId: profile.id }), [profile.id])

  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const by = (ss) => jobs.filter((j) => ss.includes(j.status))
  const active = by(ACTIVE_JOB).sort(
    (a, b) => (a.status === 'RETURNED' ? -1 : 0) - (b.status === 'RETURNED' ? -1 : 0)
  )
  const returned = by(['RETURNED'])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${profile.full_name.split(' ')[0]}`}
        subtitle="Your assigned maintenance jobs at a glance."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Assigned jobs"
          value={by(ACTIVE_JOB.concat('AWAITING_VERIFICATION')).length}
          icon={Briefcase}
          to="/technician/jobs"
        />
        <StatCard
          label="Pending (not started)"
          value={by(['ASSIGNED', 'ACCEPTED']).length}
          icon={Clock}
          tone="amber"
          to="/technician/jobs?tab=pending"
        />
        <StatCard
          label="In progress"
          value={by(['IN_PROGRESS', 'RETURNED']).length}
          icon={Wrench}
          tone="violet"
          to="/technician/jobs?tab=in_progress"
        />
        <StatCard
          label="Completed"
          value={by(['AWAITING_VERIFICATION', 'RESOLVED']).length}
          icon={CheckCircle2}
          tone="green"
          to="/technician/history"
        />
      </div>

      {returned.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>
              {returned.length} job{returned.length > 1 ? 's were' : ' was'} returned
            </strong>{' '}
            by a supervisor for correction. Review the feedback and redo the work.
          </p>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Active jobs</h2>
          <Link
            to="/technician/jobs"
            className="text-sm font-medium text-primary-700 hover:underline"
          >
            View all
          </Link>
        </div>
        {active.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {active.slice(0, 6).map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No active jobs"
            message="New assignments will appear here and you will be notified."
          />
        )}
      </section>
    </div>
  )
}
