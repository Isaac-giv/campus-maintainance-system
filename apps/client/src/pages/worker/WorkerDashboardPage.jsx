// apps/client/src/pages/worker/WorkerDashboardPage.jsx
// Dedicated Maintenance Technician Dashboard featuring daily KPIs,
// duty status toggle, priority dispatches, schedule, and safety protocols.

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Building,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'

export default function WorkerDashboardPage() {
  const { profile } = useAuth()
  const { reports, startWork } = useReports()
  const [onDuty, setOnDuty] = useState(true)

  // Worker active and assigned tasks
  const myAssignedJobs = reports.filter(
    (r) =>
      r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS' || r.status === 'REJECTED'
  )
  const inProgressJobs = reports.filter((r) => r.status === 'IN_PROGRESS')
  const awaitingVerification = reports.filter((r) => r.status === 'AWAITING_VERIFICATION')
  const resolvedJobs = reports.filter((r) => r.status === 'RESOLVED')

  const urgentJobs = myAssignedJobs.filter(
    (r) => r.priority === 'HIGH' || r.priority === 'CRITICAL' || r.priority === 'MEDIUM'
  )

  return (
    <div className="space-y-6">
      {/* ── HEADER & DUTY TOGGLE ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Technician Command Center
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                onDuty
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span>{onDuty ? 'ON ACTIVE DUTY' : 'OFF DUTY'}</span>
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Assigned Technician:{' '}
            <span className="font-semibold text-primary-700">
              {profile?.fullName || 'Engr. Musa Sani'}
            </span>{' '}
            • Electrical & Power Infrastructure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnDuty(!onDuty)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors shadow-sm ${
              onDuty
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {onDuty ? 'Set Status: Off Duty' : 'Set Status: On Duty'}
          </button>
          <Link
            to="/worker/tasks"
            className="btn-primary text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Wrench className="h-4 w-4" />
            <span>View Task Queue ({myAssignedJobs.length})</span>
          </Link>
        </div>
      </div>

      {/* ── 4 STAT CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {myAssignedJobs.length}
            </div>
            <div className="text-xs font-medium text-gray-500">Assigned Tasks</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {inProgressJobs.length}
            </div>
            <div className="text-xs font-medium text-gray-500">In Active Repair</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {awaitingVerification.length}
            </div>
            <div className="text-xs font-medium text-gray-500">
              Awaiting Supervisor Sign-off
            </div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{resolvedJobs.length}</div>
            <div className="text-xs font-medium text-gray-500">Completed & Verified</div>
          </div>
        </div>
      </div>

      {/* ── PRIORITY WORK ORDERS & DISPATCHES ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Repairs Column (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Priority Work Orders Requiring Action
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assigned facility maintenance tickets within your electrical/mechanical
                  scope.
                </p>
              </div>
              <Link
                to="/worker/tasks"
                className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
              >
                <span>All Orders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {urgentJobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No outstanding urgent work orders. Check the general task queue!
              </div>
            ) : (
              <div className="space-y-3">
                {urgentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-primary-400 bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        {job.trackingCode.slice(-3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              job.priority === 'CRITICAL' || job.priority === 'HIGH'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {job.priority || 'MEDIUM'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Building className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {job.hostelBlock} • Room {job.roomNumber}
                          </span>
                          <span>•</span>
                          <span>{job.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {job.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => startWork(job.id)}
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Start Job</span>
                        </button>
                      ) : (
                        <Link
                          to={`/worker/jobs/${job.id}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>Finish & Submit</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Route & Schedule */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-700" />
              <span>Today&apos;s Field Maintenance Schedule</span>
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 text-xs">
                <span className="font-mono font-bold text-primary-800 shrink-0">
                  09:00 AM
                </span>
                <div>
                  <div className="font-bold text-gray-900">
                    Hostel Block A — Room 102 Inspection
                  </div>
                  <div className="text-gray-500">
                    Fluorescent ballast replacement & circuit continuity test.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 text-xs">
                <span className="font-mono font-bold text-primary-800 shrink-0">
                  11:30 AM
                </span>
                <div>
                  <div className="font-bold text-gray-900">
                    Hostel Block B — Electrical Panel Servicing
                  </div>
                  <div className="text-gray-500">
                    Thermal scan of 2nd floor corridor distribution breaker.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 text-xs">
                <span className="font-mono font-bold text-primary-800 shrink-0">
                  02:30 PM
                </span>
                <div>
                  <div className="font-bold text-gray-900">
                    Water Pump Station — Dual Sensor Calibration
                  </div>
                  <div className="text-gray-500">
                    Joint maintenance with plumbing specialist Emeka Okafor.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Tools & Safety Checklist (1 span) */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Safety & Tool Checklist</span>
            </h2>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-700 focus:ring-primary-500"
                />
                <span>Insulated Hand Tools & Multimeter</span>
              </li>
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-700 focus:ring-primary-500"
                />
                <span>Safety Eyewear & Rubber Soles</span>
              </li>
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-700 focus:ring-primary-500"
                />
                <span>Lockout / Tagout (LOTO) Kit</span>
              </li>
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-700 focus:ring-primary-500"
                />
                <span>Smartphone for Resolution Photo Upload</span>
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <span className="font-bold">Protocol Reminder:</span> Every completed repair
              requires clear photographic proof before the supervisor can approve and
              close the ticket.
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="card p-6 bg-primary-900 text-white">
            <h3 className="text-sm font-bold text-white mb-1">
              Field Maintenance Hotline
            </h3>
            <p className="text-xs text-primary-200 mb-3">
              Need immediate supervisor assistance or structural backup?
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-primary-300">Supervisor Bello:</span>
                <span className="font-mono font-bold text-accent">Ext. 204</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Central Control:</span>
                <span className="font-mono font-bold text-accent">Ext. 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
