// apps/client/src/pages/student/StudentDashboardPage.jsx
// Student dashboard strictly conforming to Mockup Screen 2

import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Megaphone,
  ArrowRight,
  Building,
  Calendar,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'

export default function StudentDashboardPage() {
  const { profile } = useAuth()
  const { reports } = useReports()

  // Filter student reports
  const studentReports = reports.filter((r) => r.studentId === profile?.id || true)

  const activeReportsCount = studentReports.filter(
    (r) => r.status === 'PENDING' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  ).length

  const resolvedReportsCount = studentReports.filter(
    (r) => r.status === 'RESOLVED'
  ).length
  const inProgressCount = studentReports.filter((r) => r.status === 'IN_PROGRESS').length
  const newUpdatesCount = 2

  // Status badge helper matching mockup
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Resolved
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            In Progress
          </span>
        )
      case 'AWAITING_VERIFICATION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">
            Awaiting Verification
          </span>
        )
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ── TOP GREETING BANNER (Mockup matched) ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hello, {profile?.fullName?.split(' ')[0] || 'Chinwe'}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Keep your campus comfortable. Report issues easily!
          </p>
        </div>

        {/* Top right pill badge matching mockup */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm self-start sm:self-auto">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Your hostel is well maintained</span>
        </div>
      </div>

      {/* ── 4 STAT METRIC CARDS (Mockup matched) ────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Reports */}
        <div className="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{activeReportsCount}</div>
            <div className="text-xs font-medium text-gray-500">Active Reports</div>
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{resolvedReportsCount}</div>
            <div className="text-xs font-medium text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
            <div className="text-xs font-medium text-gray-500">In Progress</div>
          </div>
        </div>

        {/* Card 4: New Updates */}
        <div className="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{newUpdatesCount}</div>
            <div className="text-xs font-medium text-gray-500">New Updates</div>
          </div>
        </div>
      </div>

      {/* ── QUICK REPORT BANNER (Mockup matched) ────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 border border-blue-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 text-primary-700 font-bold text-lg mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary-700 text-white flex items-center justify-center">
              <Megaphone className="h-4 w-4" />
            </div>
            <span>Quick Report</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Report a maintenance issue in just a few clicks. Upload a photo and track
            worker progress in real time.
          </p>
          <Link
            to="/student/reports/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 transition-colors"
          >
            <span>Report an Issue</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Decorative campus photo card */}
        <div className="relative z-10 hidden md:block w-72 h-36 rounded-xl overflow-hidden shadow-md border border-white/80">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"
            alt="Cosmopolitan University Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 to-transparent flex items-end p-2.5">
            <span className="text-[11px] font-semibold text-white">
              Hostel Block Maintenance
            </span>
          </div>
        </div>
      </div>

      {/* ── RECENT REPORTS SECTION ──────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Reports</h2>
            <p className="text-xs text-gray-500">
              Issues you submitted for your hostel room
            </p>
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
          {studentReports.slice(0, 3).map((report) => (
            <div
              key={report.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={report.photoUrl}
                  alt={report.title}
                  className="h-14 w-14 rounded-xl object-cover shrink-0 border border-gray-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{report.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      {report.hostelBlock}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                {getStatusBadge(report.status)}
                <Link
                  to={`/student/reports/${report.id}`}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-900 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
