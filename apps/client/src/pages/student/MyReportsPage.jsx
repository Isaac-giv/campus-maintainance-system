// apps/client/src/pages/student/MyReportsPage.jsx
// List of student reports strictly conforming to Mockup Screen 4

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Building,
  Calendar,
  ArrowRight,
  PlusCircle,
  FileQuestion,
} from 'lucide-react'
import { useReports } from '../../context/ReportContext.jsx'

export default function MyReportsPage() {
  const { reports } = useReports()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.hostelBlock.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Status badge matching mockup
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Resolved
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            In Progress
          </span>
        )
      case 'AWAITING_VERIFICATION':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">
            Awaiting Verification
          </span>
        )
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            Assigned
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Cancelled
          </span>
        )
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER & CONTROLS (Mockup Screen 4) ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the resolution lifecycle of your reported issues
          </p>
        </div>

        <Link
          to="/student/reports/new"
          className="btn-primary self-start sm:self-auto flex items-center gap-2 text-xs font-semibold py-2 px-4 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Report</span>
        </Link>
      </div>

      {/* ── SEARCH & FILTER BAR ─────────────────────────────────── */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tracking code, or block..."
            className="input pl-9 py-1.5 text-xs"
          />
        </div>

        {/* Filter Dropdown matching mockup */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-1.5 px-3 text-xs bg-white font-medium w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── REPORTS LIST (Mockup Screen 4 Table / Cards) ────────── */}
      <div className="card overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileQuestion className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">No reports found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
              >
                {/* Left side: Thumbnail & Information */}
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <img
                      src={report.photoUrl}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                        {report.title}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                        {report.trackingCode}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        {report.hostelBlock} • Room {report.roomNumber}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="text-primary-700 font-medium">
                        {report.category}
                      </span>
                    </div>

                    {report.workerName && (
                      <p className="text-[11px] text-gray-600 mt-1.5">
                        Assigned Technician:{' '}
                        <span className="font-semibold text-gray-800">
                          {report.workerName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Status badge & Action Link */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                  <div>{getStatusBadge(report.status)}</div>
                  <Link
                    to={`/student/reports/${report.id}`}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
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
