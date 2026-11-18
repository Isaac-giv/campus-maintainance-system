// apps/client/src/pages/student/CreateReportPage.jsx
// Submit report page strictly conforming to Mockup Screen 3

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'

export default function CreateReportPage() {
  const { profile } = useAuth()
  const { categories, hostelBlocks, addReport } = useReports()
  const navigate = useNavigate()

  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [hostelBlock, setHostelBlock] = useState(profile?.hostelBlock || 'Hostel Block A')
  const [roomNumber, setRoomNumber] = useState(profile?.roomNumber || '102')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Default sample image when user hasn't uploaded their own (resembling the mockup leaking pipe)
  const defaultSamplePhoto =
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'

  const activePhoto = photoUrl || defaultSamplePhoto

  // Handle local image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.')
        return
      }
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoUrl(reader.result)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !description) {
      setError('Please provide a title and detailed description.')
      return
    }

    const selectedCategory = categories.find((c) => c.id === categoryId)

    addReport(
      {
        title,
        description,
        category: selectedCategory?.name || 'General Maintenance',
        categoryId,
        specificLocationDetails: `Hostel ${hostelBlock}, Room ${roomNumber}`,
        photoUrl: activePhoto,
      },
      profile
    )

    setSubmitted(true)
    setTimeout(() => {
      navigate('/student/reports')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Report a Maintenance Issue
        </h1>
        <p className="mt-1 text-sm text-gray-500">Let us know what the problem is.</p>
      </div>

      {submitted ? (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Report Submitted Successfully!
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Your tracking code has been issued. Redirecting to your reports overview...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT FORM (Mockup Screen 3) ────────────────────────── */}
          <div className="lg:col-span-7 card p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Issue Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Issue Type *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input bg-white"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Summary */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Issue Summary *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leaking Pipe or Broken Door Lock"
                  className="input"
                  required
                />
              </div>

              {/* Location (Auto derived / editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <select
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    className="input bg-white"
                  >
                    {hostelBlocks.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Room / Specific Area
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 102 or Common Bath"
                    className="input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="input resize-none"
                  required
                />
              </div>

              {/* Upload Photo Dropzone matching mockup */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Upload Photo (Optional)
                </label>
                <label className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary-500 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs font-semibold text-primary-700">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">
                    (PNG, JPG up to 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit button with send icon */}
              <button
                type="submit"
                disabled={isUploading}
                className="btn-primary w-full py-3 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-4"
              >
                <Send className="h-4 w-4" />
                <span>Submit Report</span>
              </button>
            </form>
          </div>

          {/* ── RIGHT PREVIEW CARD (Mockup Screen 3) ───────────────── */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="card p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Evidence Photo Preview
                </span>
                {photoUrl && (
                  <button
                    onClick={() => setPhotoUrl('')}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Image display */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border border-gray-200 shadow-inner flex items-center justify-center">
                <img
                  src={activePhoto}
                  alt="Evidence Preview"
                  className="w-full h-full object-cover"
                />
                {!photoUrl && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-white text-[11px] flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-accent" />
                    <span>Sample preview shown. Upload your own photo above.</span>
                  </div>
                )}
              </div>

              {/* Live Preview of Details */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Title:</span>
                  <span className="font-semibold text-gray-800">
                    {title || 'Untitled Report'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold text-gray-800">
                    {hostelBlock}, Room {roomNumber || '101'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Status upon submit:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    PENDING TRIAGE
                  </span>
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 p-4 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">💡 Maintenance Tip:</span> Providing clear,
              well-lit photos helps hostel supervisors assign the correct technician with
              appropriate spare parts faster.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
