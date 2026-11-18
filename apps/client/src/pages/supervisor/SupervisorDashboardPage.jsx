// apps/client/src/pages/supervisor/SupervisorDashboardPage.jsx
// Supervisor dashboard overview for hostel maintenance management

import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle2, Wrench, ArrowRight, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'

export default function SupervisorDashboardPage() {
  const { profile } = useAuth()
  const { reports, workers } = useReports()

  const pendingTriage = reports.filter((r) => r.status === 'PENDING')
  const awaitingVerification = reports.filter((r) => r.status === 'AWAITING_VERIFICATION')
  const inProgress = reports.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED'
  )
  const resolved = reports.filter((r) => r.status === 'RESOLVED')

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Supervisor Overview — {profile?.fullName || 'Mr. Bello Ahmed'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Assigned Oversight:{' '}
            <span className="font-semibold text-primary-700">Hostel Blocks A & B</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/supervisor/triage"
            className="btn-primary text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Clock className="h-4 w-4" />
            <span>Triage Queue ({pendingTriage.length})</span>
          </Link>
          <Link
            to="/supervisor/verify"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Verifications ({awaitingVerification.length})</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{pendingTriage.length}</div>
            <div className="text-xs font-medium text-gray-500">Awaiting Triage</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {awaitingVerification.length}
            </div>
            <div className="text-xs font-medium text-gray-500">Pending Sign-off</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{inProgress.length}</div>
            <div className="text-xs font-medium text-gray-500">Active Work Orders</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{resolved.length}</div>
            <div className="text-xs font-medium text-gray-500">Resolved This Month</div>
          </div>
        </div>
      </div>

      {/* Technicians On Duty */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">
          Maintenance Technicians on Duty
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Availability status for work order dispatching
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-sm shrink-0">
                {worker.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-gray-900 truncate">
                  {worker.name}
                </h3>
                <p className="text-[11px] text-gray-500 truncate">{worker.specialty}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {worker.activeJobs} Active Jobs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent Action Queue */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Urgent Reports Awaiting Triage
            </h2>
            <p className="text-xs text-gray-500">
              Pending reports that require technician assignment
            </p>
          </div>
          <Link
            to="/supervisor/triage"
            className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
          >
            <span>Open Triage Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {pendingTriage.map((rep) => (
            <div
              key={rep.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 px-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={rep.photoUrl}
                  alt={rep.title}
                  className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    {rep.title}
                  </h3>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    <span>
                      {rep.hostelBlock} • Room {rep.roomNumber}
                    </span>
                    <span>•</span>
                    <span className="text-primary-700 font-medium">{rep.category}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/supervisor/triage"
                className="btn-primary text-xs font-semibold py-1.5 px-3 self-end sm:self-auto"
              >
                Assign Technician
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
