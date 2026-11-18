// apps/client/src/pages/student/ReportDetailsPage.jsx
// Detailed report view with timeline, photos, worker notes, and role-based action triggers

import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Wrench,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'

export default function ReportDetailsPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { reports, startWork, completeWork, verifyAndResolve, rejectWork, cancelReport } =
    useReports()

  const [workerNotes, setWorkerNotes] = useState('')
  const [supervisorNotes, setSupervisorNotes] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const report = reports.find((r) => r.id === id)

  if (!report) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Report Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          The requested maintenance report could not be found.
        </p>
        <Link
          to="/student/reports"
          className="btn-primary mt-4 inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Reports</span>
        </Link>
      </div>
    )
  }

  const currentRole = profile?.role || 'STUDENT'

  const handleStartWork = () => {
    startWork(report.id)
    setActionMessage('Job status updated to IN PROGRESS.')
  }

  const handleCompleteWork = () => {
    completeWork(report.id, workerNotes || 'Technician finished the repair successfully.')
    setActionMessage('Work submitted for supervisor verification.')
  }

  const handleVerify = () => {
    verifyAndResolve(
      report.id,
      supervisorNotes || 'Verified by supervisor on site. All good.'
    )
    setActionMessage('Report verified and resolved!')
  }

  const handleReject = () => {
    rejectWork(
      report.id,
      supervisorNotes || 'Work does not meet standards. Rework requested.'
    )
    setActionMessage('Rework order sent back to worker.')
  }

  const handleCancel = () => {
    cancelReport(report.id, 'Cancelled by student.')
    setActionMessage('Report cancelled.')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Reports</span>
        </Link>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-bold">
          {report.trackingCode}
        </span>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main card */}
      <div className="card p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                {report.title}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                {report.category}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
              <span className="inline-flex items-center gap-1 font-medium">
                <Building className="h-3.5 w-3.5 text-gray-400" />
                {report.hostelBlock} • Room {report.roomNumber}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {new Date(report.createdAt).toLocaleString()}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-400" />
                Reported by {report.studentName}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-900">
              Status: {report.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Issue Description
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {report.description}
          </p>
          {report.specificLocationDetails && (
            <p className="text-xs text-gray-500 mt-2">
              <span className="font-semibold">Exact Location Details:</span>{' '}
              {report.specificLocationDetails}
            </p>
          )}
        </div>

        {/* Photos (Initial + Resolution evidence) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Photographic Evidence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-600 mb-1.5">
                Initial Photo (Reported by Student)
              </span>
              <div className="rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border border-gray-200 shadow-sm">
                <img
                  src={report.photoUrl}
                  alt="Initial Issue"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {report.resolutionPhotoUrl && (
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1.5">
                  Resolution Photo (Uploaded by Technician)
                </span>
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border border-gray-200 shadow-sm">
                  <img
                    src={report.resolutionPhotoUrl}
                    alt="Resolved evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technician and Supervisor Notes */}
        {(report.workerNotes || report.supervisorNotes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {report.workerNotes && (
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-xs font-bold text-purple-900 block mb-1">
                  🔧 Technician Resolution Notes:
                </span>
                <p className="text-xs text-purple-800">{report.workerNotes}</p>
              </div>
            )}
            {report.supervisorNotes && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-900 block mb-1">
                  📋 Supervisor Verification Notes:
                </span>
                <p className="text-xs text-emerald-800">{report.supervisorNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Status History Timeline */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
            Audit Trail & Timeline
          </h3>
          <div className="space-y-4">
            {report.statusHistory.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{step.status}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      {new Date(step.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-0.5">{step.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role-Based Actions Section */}
        <div className="pt-6 border-t border-gray-100 bg-gray-50/70 p-5 rounded-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
            Available Actions for: <span className="text-primary-700">{currentRole}</span>
          </h3>

          {/* Student action: Cancel if PENDING */}
          {currentRole === 'STUDENT' && report.status === 'PENDING' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Cancel This Report
            </button>
          )}

          {/* Worker actions */}
          {(currentRole === 'WORKER' || currentRole === 'ADMIN') && (
            <div className="space-y-3">
              {report.status === 'ASSIGNED' && (
                <button
                  onClick={handleStartWork}
                  className="btn-primary text-xs font-semibold py-2 px-4 flex items-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Start Work (Commence Maintenance)</span>
                </button>
              )}

              {report.status === 'IN_PROGRESS' && (
                <div className="space-y-2 max-w-md">
                  <input
                    type="text"
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    placeholder="Enter technician completion notes..."
                    className="input text-xs"
                  />
                  <button
                    onClick={handleCompleteWork}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Job & Request Verification</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Supervisor actions */}
          {(currentRole === 'SUPERVISOR' || currentRole === 'ADMIN') && (
            <div className="space-y-3">
              {report.status === 'AWAITING_VERIFICATION' && (
                <div className="space-y-2 max-w-md">
                  <input
                    type="text"
                    value={supervisorNotes}
                    onChange={(e) => setSupervisorNotes(e.target.value)}
                    placeholder="Enter verification notes or inspection feedback..."
                    className="input text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleVerify}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve & Mark Resolved</span>
                    </button>
                    <button
                      onClick={handleReject}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Request Rework</span>
                    </button>
                  </div>
                </div>
              )}

              {report.status === 'PENDING' && (
                <Link
                  to="/supervisor/triage"
                  className="btn-primary text-xs font-semibold py-2 px-4 inline-flex items-center gap-2"
                >
                  <span>Go to Triage Queue to Assign Technician</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
