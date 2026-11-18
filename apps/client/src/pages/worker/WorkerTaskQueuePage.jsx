// apps/client/src/pages/worker/WorkerTaskQueuePage.jsx
// Maintenance technician task queue for managing active work orders

import React from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Clock, Building, ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'

export default function WorkerTaskQueuePage() {
  const { profile } = useAuth()
  const { reports, startWork } = useReports()

  // Find jobs assigned to current worker (or show all in-progress/assigned for demo worker)
  const workerJobs = reports.filter(
    (r) =>
      r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS' || r.status === 'REJECTED'
  )

  const completedJobs = reports.filter(
    (r) =>
      (r.status === 'AWAITING_VERIFICATION' || r.status === 'RESOLVED') &&
      (r.currentWorkerId === profile?.id || r.workerName?.includes('Musa'))
  )

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Assigned Work Orders
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Technician:{' '}
          <span className="font-semibold text-primary-700">
            {profile?.fullName || 'Engr. Musa Sani'}
          </span>{' '}
          • Electrical & Power Maintenance
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{workerJobs.length}</div>
            <div className="text-xs font-medium text-gray-500">Active Work Orders</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {workerJobs.filter((j) => j.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs font-medium text-gray-500">In Progress On-Site</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{completedJobs.length}</div>
            <div className="text-xs font-medium text-gray-500">Completed & Verified</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Active Work Orders Requiring Attention
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {workerJobs.length} tasks
          </span>
        </div>

        {workerJobs.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">No pending work orders</p>
            <p className="text-xs text-gray-500 mt-1">You are all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {workerJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={job.photoUrl}
                    alt={job.title}
                    className="h-16 w-16 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-600">
                        {job.trackingCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.priority === 'HIGH' || job.priority === 'EMERGENCY'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {job.priority} PRIORITY
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 max-w-xl">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        {job.hostelBlock} • Room {job.roomNumber}
                      </span>
                      <span>•</span>
                      <span>Category: {job.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-purple-700">
                        Status: {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {job.status === 'ASSIGNED' && (
                    <button
                      onClick={() => startWork(job.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 text-white text-xs font-semibold hover:bg-primary-800 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Job</span>
                    </button>
                  )}
                  <Link
                    to={`/worker/jobs/${job.id}`}
                    className="btn-primary text-xs font-semibold py-1.5 px-3.5 flex items-center gap-1.5"
                  >
                    <span>Execute Order</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
