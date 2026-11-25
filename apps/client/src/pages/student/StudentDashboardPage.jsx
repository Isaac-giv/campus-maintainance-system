import React from 'react'
import { Link } from 'react-router-dom'
import {
  FilePlus2,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Droplets,
  Zap,
  Armchair,
  Wind,
  Wifi,
  Sparkles,
  Building,
  GraduationCap,
  ArrowRight,
  Info,
} from 'lucide-react'
import { STATUS_GROUPS } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchReports } from '../../services/api.js'
import {
  EmptyState,
  ErrorState,
  Spinner,
  StatCard,
  cx,
} from '../../components/ui/index.jsx'
import { ReportTable } from '../../components/reports/ReportParts.jsx'

export const countIn = (reports, statuses) =>
  reports.filter((r) => statuses.includes(r.status)).length

const COMMON_STUDENT_FIXES = [
  {
    name: 'Plumbing & Taps',
    categoryQuery: 'Plumbing',
    icon: Droplets,
    desc: 'Leaking tap, clogged sink, cold shower, toilet flush',
    tone: 'text-sky-700 bg-sky-50/80 border-sky-200 hover:border-sky-400 hover:bg-sky-100/60',
  },
  {
    name: 'Power & Sockets',
    categoryQuery: 'Electrical',
    icon: Zap,
    desc: 'Blown bulb, dead study socket, ceiling fan switch',
    tone: 'text-amber-700 bg-amber-50/80 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60',
  },
  {
    name: 'Furniture & Locks',
    categoryQuery: 'Furniture',
    icon: Armchair,
    desc: 'Jammed door key, loose study desk, wardrobe hinge',
    tone: 'text-indigo-700 bg-indigo-50/80 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100/60',
  },
  {
    name: 'Fan & Room Air',
    categoryQuery: 'Air Conditioning',
    icon: Wind,
    desc: 'Screeching ceiling fan, room AC leak, broken mesh',
    tone: 'text-teal-700 bg-teal-50/80 border-teal-200 hover:border-teal-400 hover:bg-teal-100/60',
  },
  {
    name: 'Hostel Wi-Fi / LAN',
    categoryQuery: 'Internet',
    icon: Wifi,
    desc: 'Hostel hotspot drops, slow speeds, broken wall port',
    tone: 'text-purple-700 bg-purple-50/80 border-purple-200 hover:border-purple-400 hover:bg-purple-100/60',
  },
]

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

  const activeFixes = reports ? countIn(reports, STATUS_GROUPS.IN_PROGRESS) : 0
  const pendingFixes = reports ? countIn(reports, STATUS_GROUPS.PENDING) : 0
  const totalActive = activeFixes + pendingFixes

  const studentMatric = profile.student?.matric_number || 'CU/2023/1042'
  const studentProgramme = profile.student?.programme || 'B.Sc. Computer Science'
  const studentLevel = profile.student?.level || '300L'
  const studentBuilding = profile.student?.building?.name || 'Hostel Block A'
  const studentRoom = profile.student?.room_number || '102'

  return (
    <div className="space-y-6">
      {/* ── 1. STUDENT IDENTITY & HOSTEL ROOM PASS (CAMPUS THEMED HERO) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-6 sm:p-8 text-white shadow-lg border border-primary-700/50">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent border border-accent/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Cosmopolitan Student Care & Facilities Desk</span>
            </div>

            <div>
              <p className="text-sm text-primary-200">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {profile.full_name} 👋
              </h1>
            </div>

            {/* Student ID & Room Allocation Pass */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950/80 px-2.5 py-1.5 font-mono font-bold text-accent border border-primary-700/60">
                <GraduationCap className="h-3.5 w-3.5 text-accent" />
                {studentMatric}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-800/80 px-2.5 py-1.5 text-primary-100 border border-primary-700/60">
                <span>{studentProgramme}</span>
                {studentLevel && <span className="text-accent font-semibold">({studentLevel})</span>}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-800/80 px-2.5 py-1.5 text-primary-100 border border-primary-700/60">
                <Building className="h-3.5 w-3.5 text-accent" />
                <span className="font-semibold">{studentBuilding}</span>
                <span className="text-primary-300">•</span>
                <span className="font-bold text-white">Room {studentRoom}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/student/reports/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-black text-primary-950 shadow-md hover:bg-amber-400 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <FilePlus2 className="h-5 w-5" />
              <span>Report Room / Facility Issue</span>
            </Link>
          </div>
        </div>

        {/* Room Status Indicator Strip */}
        <div className="mt-6 border-t border-primary-700/60 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={cx(
                'h-2.5 w-2.5 rounded-full',
                totalActive > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              )}
            />
            <span className="font-medium text-primary-200">
              Hostel Room Condition:{' '}
              <strong className="text-white">
                {totalActive > 0
                  ? `${totalActive} active repair${totalActive > 1 ? 's' : ''} in progress`
                  : 'All clear — No reported issues in your room'}
              </strong>
            </span>
          </div>

          <div className="text-primary-300 text-[11px]">
            Average fix turnaround time in your hostel block: <span className="font-bold text-accent">~4 hours</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          {/* ── 2. METRIC CARDS ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="My Total Complaints"
              value={reports.length}
              icon={FileText}
              to="/student/reports"
            />
            <StatCard
              label="Awaiting Supervisor"
              value={countIn(reports, STATUS_GROUPS.PENDING)}
              icon={Clock}
              tone="amber"
              to="/student/reports?status=PENDING_GROUP"
            />
            <StatCard
              label="Fix in Progress"
              value={countIn(reports, STATUS_GROUPS.IN_PROGRESS)}
              icon={Wrench}
              tone="violet"
              to="/student/reports?status=IN_PROGRESS_GROUP"
            />
            <StatCard
              label="Fixed & Certified"
              value={countIn(reports, STATUS_GROUPS.RESOLVED)}
              icon={CheckCircle2}
              tone="green"
              to="/student/reports?status=RESOLVED"
            />
          </div>

          {/* ── 3. COMMON STUDENT FIXES (ONE-TAP SHORTCUTS) ──────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                  ⚡ Common Hostel Room Fixes (Quick Lodging)
                </h2>
                <p className="text-xs text-gray-500">
                  Select a frequent hostel issue to pre-fill your complaint form instantly:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {COMMON_STUDENT_FIXES.map((fix) => {
                const Icon = fix.icon
                return (
                  <Link
                    key={fix.name}
                    to={`/student/reports/new?category=${encodeURIComponent(fix.categoryQuery)}`}
                    className={cx(
                      'group rounded-xl border p-3.5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between',
                      fix.tone
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-white/80 shadow-xs">
                          <Icon className="h-4 w-4" />
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 mb-1">{fix.name}</h3>
                      <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                        {fix.desc}
                      </p>
                    </div>
                    <span className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                      Report this fix →
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── 4. HOSTEL LIFE & LIVING TIPS BULLETIN ────────────── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-800 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Hostel Living & Care Guidelines
                </h3>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900">
                  <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/60">
                    <strong className="block text-[11px] font-bold text-amber-950 mb-0.5">
                      🚿 Water Pumping Hours
                    </strong>
                    <span>
                      Tanks are pumped from 06:00 to 08:30 AM & 05:30 to 08:00 PM daily.
                    </span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/60">
                    <strong className="block text-[11px] font-bold text-amber-950 mb-0.5">
                      💡 High-Load Appliances
                    </strong>
                    <span>
                      Unplug immersion heaters before leaving room to prevent floor breaker trips.
                    </span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/60">
                    <strong className="block text-[11px] font-bold text-amber-950 mb-0.5">
                      🚨 Night-time Emergency
                    </strong>
                    <span>
                      For sparking sockets or burst pipes after 10 PM, alert your Floor Porter.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 5. RECENT REPORTS TABLE ──────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Recent Complaints & Status</h2>
                <p className="text-xs text-gray-500">
                  Follow step-by-step progress from supervisor review to final technician fix.
                </p>
              </div>
              <Link
                to="/student/reports"
                className="text-xs font-bold text-primary-700 hover:underline flex items-center gap-1"
              >
                <span>View all reports</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ReportTable
              reports={reports.slice(0, 5)}
              linkTo={(r) => `/student/reports/${r.id}`}
              empty={
                <EmptyState
                  title="🎉 No reported complaints!"
                  message="Everything in Room 102 seems to be in order right now. If something breaks or leaks, click Report an Issue."
                  action={
                    <Link to="/student/reports/new" className="btn-primary">
                      <FilePlus2 className="mr-1.5 h-4 w-4" /> Report an Issue
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
