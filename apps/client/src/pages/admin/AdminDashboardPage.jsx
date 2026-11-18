// apps/client/src/pages/admin/AdminDashboardPage.jsx
// Admin dashboard strictly conforming to Mockup Screen 5

import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { useReports } from '../../context/ReportContext.jsx'

export default function AdminDashboardPage() {
  const { reports } = useReports()

  const totalReports = 48
  const resolvedCount = 32
  const inProgressCount = 14
  const pendingCount = 2

  // Percentages matching mockup: 67% Resolved, 29% In Progress, 4% Pending
  const resolvedPct = 67
  const inProgressPct = 29
  const pendingPct = 4

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive facility performance and maintenance metrics across Cosmopolitan
            University
          </p>
        </div>
      </div>

      {/* ── 4 STAT CARDS (Mockup Screen 5) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalReports}</div>
            <div className="text-xs font-medium text-gray-500">Total Reports</div>
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{resolvedCount}</div>
            <div className="text-xs font-medium text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
            <div className="text-xs font-medium text-gray-500">In Progress</div>
          </div>
        </div>

        {/* Card 4: Pending */}
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
            <div className="text-xs font-medium text-gray-500">Pending</div>
          </div>
        </div>
      </div>

      {/* ── SPLIT SECTION: Reports Overview Chart & Recent Reports ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Reports Overview Chart widget (Mockup Screen 5 Left) */}
        <div className="lg:col-span-5 card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Reports Overview</h2>
          <p className="text-xs text-gray-500 mb-6">Resolution efficiency breakdown</p>

          {/* Visual Progress Doughnut / Distribution */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative h-44 w-44 rounded-full flex items-center justify-center shadow-inner">
              {/* Conic gradient representing the circular chart */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    #22c55e 0% 67%,
                    #f59e0b 67% 96%,
                    #3b82f6 96% 100%
                  )`,
                }}
              />
              <div className="relative h-28 w-28 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
                <span className="text-2xl font-extrabold text-gray-900">
                  {totalReports}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total
                </span>
              </div>
            </div>

            {/* Legend matching mockup */}
            <div className="mt-8 grid grid-cols-3 gap-4 w-full text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Resolved</span>
                </div>
                <span className="text-base font-bold text-gray-900 mt-1">
                  {resolvedPct}%
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>In Progress</span>
                </div>
                <span className="text-base font-bold text-gray-900 mt-1">
                  {inProgressPct}%
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span>Pending</span>
                </div>
                <span className="text-base font-bold text-gray-900 mt-1">
                  {pendingPct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports widget (Mockup Screen 5 Right) */}
        <div className="lg:col-span-7 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Reports</h2>
              <p className="text-xs text-gray-500">Live feed across all hostel blocks</p>
            </div>
            <Link
              to="/student/reports"
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {reports.slice(0, 5).map((rep) => (
              <div
                key={rep.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/60 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rep.photoUrl}
                    alt={rep.title}
                    className="h-11 w-11 rounded-lg object-cover shrink-0 border border-gray-200"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                      {rep.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{rep.hostelBlock}</span>
                      <span>•</span>
                      <span>{rep.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rep.status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/student/reports/${rep.id}`}
                    className="p-1 text-gray-400 hover:text-primary-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
