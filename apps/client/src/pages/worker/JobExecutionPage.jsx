// apps/client/src/pages/worker/JobExecutionPage.jsx
// Technician work order execution screen with photo evidence upload and completion submit

import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
} from 'lucide-react'
import { useReports } from '../../context/ReportContext.jsx'

export default function JobExecutionPage() {
  const { id } = useParams()
  const { reports, startWork, completeWork } = useReports()
  const navigate = useNavigate()

  const report = reports.find((r) => r.id === id)

  const [workerNotes, setWorkerNotes] = useState(report?.workerNotes || '')
  const [resolutionPhoto, setResolutionPhoto] = useState(report?.resolutionPhotoUrl || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  if (!report) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Work Order Not Found</h2>
        <Link
          to="/worker"
          className="btn-primary mt-4 inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Task Queue</span>
        </Link>
      </div>
    )
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setResolutionPhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStart = () => {
    startWork(report.id)
  }

  const handleSubmitCompletion = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    completeWork(
      report.id,
      workerNotes || 'Repair completed according to university technical specifications.',
      resolutionPhoto ||
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
    )
    setIsSubmitting(false)
    setCompleted(true)
    setTimeout(() => {
      navigate('/worker')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/worker"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Work Order Queue</span>
        </Link>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-bold">
          {report.trackingCode}
        </span>
      </div>

      {completed ? (
        <div className="card p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Work Order Completed!</h2>
          <p className="text-sm text-gray-600 mt-2">
            Evidence submitted to hostel supervisor for inspection and sign-off.
          </p>
        </div>
      ) : (
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {report.title}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {report.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Building className="h-3.5 w-3.5 text-gray-400" />
                  {report.hostelBlock} • Room {report.roomNumber}
                </span>
                <span>•</span>
                <span>
                  Priority: <strong className="text-red-700">{report.priority}</strong>
                </span>
              </div>
            </div>

            {report.status === 'ASSIGNED' && (
              <button
                onClick={handleStart}
                className="btn-primary text-xs font-semibold py-2 px-4 flex items-center gap-2 self-start"
              >
                <Play className="h-4 w-4" />
                <span>Mark Work Started</span>
              </button>
            )}
          </div>

          {/* Issue summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Issue Description & Location
            </h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {report.description}
            </p>
          </div>

          {/* Photo comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Reported Photo (Student)
              </span>
              <div className="rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border border-gray-200">
                <img
                  src={report.photoUrl}
                  alt="Reported problem"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Resolution Evidence Photo *
              </span>
              {resolutionPhoto ? (
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border-2 border-emerald-500">
                  <img
                    src={resolutionPhoto}
                    alt="Resolution evidence"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setResolutionPhoto('')}
                    className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-xl aspect-[4/3] flex flex-col items-center justify-center p-4 hover:border-primary-500 hover:bg-gray-50 cursor-pointer transition-colors">
                  <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs font-semibold text-primary-700">
                    Upload repaired photo
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">
                    Proof of completed work
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Completion Form */}
          <form
            onSubmit={handleSubmitCompletion}
            className="space-y-4 pt-4 border-t border-gray-100"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Technician Completion Notes *
              </label>
              <textarea
                rows={3}
                value={workerNotes}
                onChange={(e) => setWorkerNotes(e.target.value)}
                placeholder="Explain what parts were replaced, repairs conducted, and safety tests performed..."
                className="input resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Submit for Supervisor Verification & Sign-off</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
