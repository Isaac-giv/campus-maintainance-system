// apps/client/src/pages/supervisor/TriageQueuePage.jsx
// Interactive triage queue where supervisors assign technicians and priorities to pending reports

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Building, CheckCircle2, X, Send } from 'lucide-react'
import { useReports } from '../../context/ReportContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function TriageQueuePage() {
  const { profile } = useAuth()
  const { reports, workers, assignWorker } = useReports()

  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0]?.id || '')
  const [priority, setPriority] = useState('MEDIUM')
  const [instructions, setInstructions] = useState('')
  const [successBanner, setSuccessBanner] = useState('')

  const pendingReports = reports.filter((r) => r.status === 'PENDING')

  const handleOpenAssign = (report) => {
    setSelectedReport(report)
    setSelectedWorkerId(workers[0]?.id || '')
    setPriority(report.priority || 'MEDIUM')
    setInstructions('')
  }

  const handleConfirmAssignment = (e) => {
    e.preventDefault()
    if (!selectedReport || !selectedWorkerId) return

    assignWorker(
      selectedReport.id,
      selectedWorkerId,
      priority,
      instructions,
      profile?.fullName || 'Supervisor'
    )

    setSuccessBanner(
      `Successfully dispatched ${selectedReport.title} (${selectedReport.trackingCode}) with ${priority} priority!`
    )
    setSelectedReport(null)

    setTimeout(() => {
      setSuccessBanner('')
    }, 4000)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Triage Queue
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review incoming student reports, assess priority, and assign available
          maintenance staff.
        </p>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Triage List */}
      <div className="card overflow-hidden">
        {pendingReports.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">Triage Queue is Clean!</h3>
            <p className="text-xs text-gray-500 mt-1">
              All submitted reports have been assigned to technicians.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    className="h-16 w-16 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {report.title}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-600">
                        {report.trackingCode}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-1 max-w-xl">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
                      <span className="font-semibold text-primary-700">
                        {report.category}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        {report.hostelBlock} • Room {report.roomNumber}
                      </span>
                      <span>•</span>
                      <span>Reported by {report.studentName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <Link
                    to={`/student/reports/${report.id}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => handleOpenAssign(report)}
                    className="btn-primary text-xs font-semibold py-1.5 px-3.5 flex items-center gap-1.5"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Assign Worker</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ASSIGNMENT MODAL / DRAWER ────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 sm:p-8 bg-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Assign Maintenance Technician
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedReport.title} ({selectedReport.trackingCode})
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Select Technician *
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="input bg-white"
                  required
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.specialty} ({w.activeJobs} active jobs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input bg-white"
                >
                  <option value="LOW">Low (Routine maintenance)</option>
                  <option value="MEDIUM">Medium (Normal priority)</option>
                  <option value="HIGH">High (Urgent facility issue)</option>
                  <option value="EMERGENCY">Emergency (Hazardous / Immediate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Special Instructions / Parts needed
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Bring replacement 40W fluorescent tube and ballast..."
                  className="input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Dispatch Work Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
