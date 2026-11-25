import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Copy } from 'lucide-react'
import { validateReport } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  fetchBuildings,
  fetchCategories,
  fetchLocations,
  submitReport,
  uploadPhotos,
} from '../../services/api.js'
import {
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Spinner,
  ErrorState,
  cx,
} from '../../components/ui/index.jsx'
import { PhotoPicker } from '../../components/reports/ReportParts.jsx'

const CATEGORY_EMOJIS = {
  Plumbing: '🚿',
  Electrical: '💡',
  'Furniture & Fittings': '🪑',
  'Air Conditioning': '❄️',
  'Internet & Network': '📶',
  'Building Structure': '🏢',
  'Sanitation & Pests': '🧹',
}

export default function CreateReportPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || searchParams.get('cat')

  const ref = useAsync(() => Promise.all([fetchCategories(), fetchBuildings()]), [])
  const [form, setForm] = useState({
    categoryId: '',
    buildingId: profile.student?.building_id || '',
    locationId: '',
    locationDetails: profile.student?.room_number
      ? `Room ${profile.student.room_number}`
      : '',
    title: '',
    description: '',
    photos: [],
  })
  const locations = useAsync(
    () =>
      form.buildingId
        ? fetchLocations({ buildingId: form.buildingId })
        : Promise.resolve([]),
    [form.buildingId]
  )
  const [errors, setErrors] = useState({})
  const [stage, setStage] = useState(null) // 'uploading' | 'saving'
  const [created, setCreated] = useState(null)

  const [categories, buildings] = ref.data || [[], []]

  // Pre-select category if supplied via URL query parameter (e.g. from quick shortcut)
  useEffect(() => {
    if (categories.length && categoryParam && !form.categoryId) {
      const match = categories.find(
        (c) =>
          c.name.toLowerCase().includes(categoryParam.toLowerCase()) ||
          c.id === categoryParam
      )
      if (match) {
        setForm((f) => ({ ...f, categoryId: match.id }))
      }
    }
  }, [categories, categoryParam, form.categoryId])

  const set = (k) => (v) => {
    setForm((f) => ({
      ...f,
      [k]: v?.target ? v.target.value : v,
      ...(k === 'buildingId' ? { locationId: '' } : {}),
    }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId]
  )

  const submit = async (e) => {
    e.preventDefault()
    const errs = validateReport(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Please correct the highlighted fields.')
      return
    }
    try {
      setStage('uploading')
      const paths = form.photos.length ? await uploadPhotos(profile.id, form.photos) : []
      setStage('saving')
      const report = await submitReport(form, paths)
      setCreated(report)
    } catch (err) {
      toast.error(err)
    } finally {
      setStage(null)
    }
  }

  if (created) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="text-xl font-bold">Complaint submitted</h1>
        <p className="text-sm text-gray-600">
          Your report has been received and sent to a supervisor for review. Keep your
          reference number for follow-up.
        </p>
        <div className="rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Reference number
          </p>
          <p className="font-mono text-2xl font-black text-primary-800">
            {created.reference_number}
          </p>
          <button
            onClick={() =>
              navigator.clipboard
                ?.writeText(created.reference_number)
                .then(() => toast.success('Copied'))
            }
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
        </div>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Link to={`/student/reports/${created.id}`} className="btn-primary">
            Track this report
          </Link>
          <button onClick={() => navigate(0)} className="btn-secondary">
            Report another issue
          </button>
        </div>
      </Card>
    )
  }

  if (ref.loading) return <Spinner />
  if (ref.error) return <ErrorState error={ref.error} onRetry={ref.reload} />

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Report an issue"
        subtitle="Provide clear details so maintenance staff can locate and fix the problem quickly."
      />
      <form onSubmit={submit} noValidate>
        <Card className="space-y-6">
          <Field label="Maintenance category" error={errors.categoryId} required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => set('categoryId')(c.id)}
                  aria-pressed={form.categoryId === c.id}
                  className={cx(
                    'rounded-xl border p-3 text-left text-sm transition flex items-center gap-2.5',
                    form.categoryId === c.id
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500 font-bold shadow-xs'
                      : 'hover:border-gray-400 bg-white'
                  )}
                >
                  <span className="text-xl shrink-0" role="img" aria-hidden="true">
                    {CATEGORY_EMOJIS[c.name] || '🛠️'}
                  </span>
                  <span className="font-semibold text-gray-900 leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
            {selectedCategory?.description && (
              <p className="mt-2 text-xs text-primary-800 bg-primary-50/60 p-2 rounded-lg border border-primary-200/50">
                ℹ️ {selectedCategory.description}
              </p>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Building" error={errors.buildingId} required htmlFor="bld">
              <Select
                id="bld"
                value={form.buildingId}
                onChange={set('buildingId')}
                placeholder="Select building"
                options={buildings.map((b) => ({ value: b.id, label: b.name }))}
              />
            </Field>
            <Field
              label="Facility / room (optional)"
              htmlFor="loc"
              hint="Choose a listed facility if available."
            >
              <Select
                id="loc"
                value={form.locationId}
                onChange={set('locationId')}
                disabled={!form.buildingId}
                placeholder={
                  form.buildingId ? 'Select (optional)' : 'Select a building first'
                }
                options={(locations.data || []).map((l) => ({
                  value: l.id,
                  label: l.name,
                }))}
              />
            </Field>
          </div>

          <Field
            label="Room or specific location"
            error={errors.locationDetails}
            required
            htmlFor="ld"
            hint="e.g. Room 214, second floor, near the staircase"
          >
            <input
              id="ld"
              className="input"
              maxLength={300}
              value={form.locationDetails}
              onChange={set('locationDetails')}
            />
          </Field>

          <Field label="Short title" error={errors.title} required htmlFor="tt">
            <input
              id="tt"
              className="input"
              maxLength={150}
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Leaking pipe under bathroom sink"
            />
          </Field>

          <Field
            label="Issue description"
            error={errors.description}
            required
            htmlFor="ds"
            hint={`${form.description.length}/2000`}
          >
            <textarea
              id="ds"
              rows={5}
              className="input"
              maxLength={2000}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the problem, when it started and how it affects you."
            />
          </Field>

          <PhotoPicker
            files={form.photos}
            onChange={set('photos')}
            error={errors.photos}
            label="Supporting photographs (recommended)"
          />

          <div className="rounded-xl bg-primary-50 p-3.5 border border-primary-200/60 text-xs text-primary-900 flex items-start gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <div>
              <p className="font-bold">Student Hostel Tip:</p>
              <p className="text-primary-800">
                Adding a clear photo and specifying the exact location (e.g. &quot;socket next to study desk 2&quot; or &quot;washbasin cold tap&quot;) helps our technician arrive with the right tools and replacement parts immediately!
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Link to="/student" className="btn-secondary">
              Cancel
            </Link>
            <Button type="submit" loading={!!stage}>
              {stage === 'uploading'
                ? 'Uploading photos…'
                : stage === 'saving'
                  ? 'Submitting…'
                  : 'Submit complaint'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
