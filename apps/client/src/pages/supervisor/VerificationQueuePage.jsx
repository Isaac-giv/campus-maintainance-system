// apps/client/src/pages/supervisor/VerificationQueuePage.jsx
// Supervisor verification queue for approving or requesting rework on completed tasks

import React, { useState } from 'react'
import { CheckCircle2, Building, Check, X, FileCheck } from 'lucide-react'
import { useReports } from '../../context/ReportContext.jsx'

export default function VerificationQueuePage() {
  const { reports, verifyAndResolve, rejectWork } = useReports()
  const [selectedReport, setSelectedReport] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionType, setActionType] = useState('APPROVE')
  const [statusMsg, setStatusMsg] = useState('')

  const awaitingReports = reports.filter((r) => r.status === 'AWAITING_VERIFICATION')

  const handleOpenAction = (report, type) => {
    setSelectedReport(report)
    setActionType(type)
    setFeedback(type === 'APPROVE' ? 'Work inspected on site and verified resolved.' : '')
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    if (!selectedReport) return

    if (actionType === 'APPROVE') {
      verifyAndResolve(selectedReport.id, feedback)
      setStatusMsg(`Report ${selectedReport.title} verified and marked RESOLVED!`)
    } else {
      rejectWork(selectedReport.id, feedback || 'Rework required by supervisor.')
      setStatusMsg(`Rework request sent to technician for ${selectedReport.title}.`)
    }

    setSelectedReport(null)
    setTimeout(() => setStatusMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Verification Queue
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Inspect completed maintenance work, review before-and-after photographic
          evidence, and sign off.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Verification List */}
      <div className="card overflow-hidden">
        {awaitingReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">
              No Jobs Awaiting Verification
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              All completed work orders have been inspected and signed off.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {awaitingReports.map((report) => (
              <div
                key={report.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50/60 transition-colors"
              >
                {/* Information & Before/After Photos */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-center">
                      <img
                        src={report.photoUrl}
                        alt="Initial problem"
                        className="h-16 w-16 rounded-xl object-cover border border-gray-200"
                      />
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">
                        INITIAL
                      </span>
                    </div>

                    <div className="text-center">
                      <img
                        src={report.resolutionPhotoUrl || report.photoUrl}
                        alt="Completed repair"
                        className="h-16 w-16 rounded-xl object-cover border-2 border-emerald-500"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                        REPAIRED
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {report.title}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                        {report.trackingCode}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold text-purple-700">Technician:</span>{' '}
                      {report.workerName || 'Assigned Worker'}
                    </p>

                    {report.workerNotes && (
                      <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                        "{report.workerNotes}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        {report.hostelBlock} • Room {report.roomNumber}
                      </span>
                      <span>•</span>
                      <span>Category: {report.category}</span>
                    </div>
                  </div>
                </div>

                {/* Approve / Reject buttons */}
                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  <button
                    onClick={() => handleOpenAction(report, 'APPROVE')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve & Sign Off</span>
                  </button>
                  <button
                    onClick={() => handleOpenAction(report, 'REJECT')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Request Rework</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {actionType === 'APPROVE'
                  ? 'Approve & Resolve Job'
                  : 'Request Rework from Technician'}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Supervisor Notes / Comments
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    actionType === 'APPROVE'
                      ? 'Add any sign-off inspection notes...'
                      : 'Explain why the work does not meet standards and what needs to be redone...'
                  }
                  className="input resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-sm ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'APPROVE'
                    ? 'Confirm Approval'
                    : 'Submit Rework Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
