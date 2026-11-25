import React from 'react'
import { Link } from 'react-router-dom'
import { FilePlus2, FileText, Clock, Wrench, CheckCircle2 } from 'lucide-react'
import { STATUS_GROUPS } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports } from '../../services/api.js'
import {
  Card,
  EmptyState,
  ErrorState,
  Spinner,
  StatCard,
} from '../../components/ui/index.jsx'
import { ReportTable } from '../../components/reports/ReportParts.jsx'

export const countIn = (reports, statuses) =>
  reports.filter((r) => statuses.includes(r.status)).length

export default function StudentDashboardPage() {
  const { profile } = useAuth()
  const {
    data: reports,
    loading,
    error,
    reload,
  } = useAsync(() => fetchReports({ studentId: profile.id }), [profile.id])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 bg-gradient-to-r from-primary-800 to-primary-600 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-primary-100">{greeting},</p>
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="mt-1 text-sm text-primary-100">
            Spotted something broken on campus? Report it and track its progress here.
          </p>
        </div>
        <Link
          to="/student/reports/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-primary-900 shadow hover:bg-amber-400"
        >
          <FilePlus2 className="h-5 w-5" /> Report an Issue
        </Link>
      </Card>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total reports"
              value={reports.length}
              icon={FileText}
              to="/student/reports"
            />
            <StatCard
              label="Pending"
              value={countIn(reports, STATUS_GROUPS.PENDING)}
              icon={Clock}
              tone="amber"
              to="/student/reports?status=PENDING_GROUP"
            />
            <StatCard
              label="In progress"
              value={countIn(reports, STATUS_GROUPS.IN_PROGRESS)}
              icon={Wrench}
              tone="violet"
              to="/student/reports?status=IN_PROGRESS_GROUP"
            />
            <StatCard
              label="Resolved"
              value={countIn(reports, STATUS_GROUPS.RESOLVED)}
              icon={CheckCircle2}
              tone="green"
              to="/student/reports?status=RESOLVED"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent reports</h2>
              <Link
                to="/student/reports"
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <ReportTable
              reports={reports.slice(0, 5)}
              linkTo={(r) => `/student/reports/${r.id}`}
              empty={
                <EmptyState
                  title="No reports yet"
                  message="When you report a maintenance issue it will appear here."
                  action={
                    <Link to="/student/reports/new" className="btn-primary">
                      Report an Issue
                    </Link>
                  }
                />
              }
            />
          </div>
        </>
      )}
    </div>
  )
}
