// Reusable report building blocks shared by all role interfaces.

import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ImagePlus,
  X,
  MapPin,
  Tag,
  User,
  Calendar,
  CheckCircle2,
  Circle,
  MessageSquare,
  Wrench,
  ShieldCheck,
} from 'lucide-react'
import {
  ROLE_LABELS,
  STATUS_LABELS,
  MAX_PHOTOS,
  ALLOWED_MIME_TYPES,
  validatePhotos,
} from '@campus/shared'
import {
  Card,
  Modal,
  StatusBadge,
  PriorityBadge,
  formatDate,
  timeAgo,
  cx,
  EmptyState,
  Table,
} from '../ui/index.jsx'

export function ReportTable({
  reports,
  linkTo,
  showStudent = false,
  showTechnician = true,
  empty,
}) {
  const columns = [
    {
      key: 'ref',
      label: 'Reference',
      render: (r) => (
        <Link
          to={linkTo(r)}
          className="font-mono text-xs font-semibold text-primary-700 hover:underline"
        >
          {r.reference_number}
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'Issue',
      render: (r) => (
        <div className="min-w-[180px]">
          <Link to={linkTo(r)} className="font-medium text-gray-900 hover:underline">
            {r.title}
          </Link>
          <p className="text-xs text-gray-500">
            {r.category?.name} · {r.building?.name} · {r.location_details}
          </p>
        </div>
      ),
    },
    ...(showStudent
      ? [{ key: 'student', label: 'Student', render: (r) => r.student?.full_name || '—' }]
      : []),
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => <PriorityBadge priority={r.priority} />,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(showTechnician
      ? [
          {
            key: 'tech',
            label: 'Technician',
            render: (r) =>
              r.technician?.full_name || <span className="text-gray-400">—</span>,
          },
        ]
      : []),
    {
      key: 'created',
      label: 'Submitted',
      className: 'whitespace-nowrap',
      render: (r) => (
        <span title={formatDate(r.created_at)}>{timeAgo(r.created_at)}</span>
      ),
    },
  ]
  return <Table columns={columns} rows={reports} empty={empty} />
}

export function ReportSummary({ report }) {
  const items = [
    { icon: Tag, label: 'Category', value: report.category?.name },
    {
      icon: MapPin,
      label: 'Location',
      value: `${report.building?.name}${report.location ? ` · ${report.location.name}` : ''} — ${report.location_details}`,
    },
    { icon: User, label: 'Reported by', value: report.student?.full_name },
    { icon: Calendar, label: 'Submitted', value: formatDate(report.created_at) },
    {
      icon: Wrench,
      label: 'Technician',
      value: report.technician?.full_name || 'Not yet assigned',
    },
    {
      icon: ShieldCheck,
      label: 'Completion date',
      value: report.resolved_at ? formatDate(report.resolved_at) : '—',
    },
  ]
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-primary-700">
          {report.reference_number}
        </span>
        <StatusBadge status={report.status} />
        <PriorityBadge priority={report.priority} />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
          {report.description}
        </p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.label} className="flex gap-2 text-sm">
            <i.icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-500">{i.label}</dt>
              <dd className="font-medium text-gray-800">{i.value || '—'}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Card>
  )
}

export function PhotoGallery({ photos, stage, title }) {
  const [open, setOpen] = useState(null)
  const list = (photos || []).filter((p) => !stage || p.stage === stage)
  return (
    <Card>
      <h2 className="mb-3 text-sm font-bold text-gray-900">{title}</h2>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">No photographs.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpen(p)}
              className="aspect-square overflow-hidden rounded-lg border bg-gray-100"
            >
              {p.url ? (
                <img
                  src={p.url}
                  alt="Report evidence"
                  className="h-full w-full object-cover hover:opacity-90"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs text-gray-500">Unavailable</span>
              )}
            </button>
          ))}
        </div>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title="Photograph" size="xl">
        {open && (
          <img
            src={open.url}
            alt="Evidence"
            className="mx-auto max-h-[75vh] rounded-lg"
          />
        )}
      </Modal>
    </Card>
  )
}

/** Controlled file picker with previews and validation. */
export function PhotoPicker({ files, onChange, error, label = 'Photographs' }) {
  const [localError, setLocalError] = useState(null)
  const previews = useMemo(
    () => files.map((f) => ({ f, url: URL.createObjectURL(f) })),
    [files]
  )
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  const add = (e) => {
    const next = [...files, ...Array.from(e.target.files || [])]
    e.target.value = ''
    const err = validatePhotos(next)
    setLocalError(err)
    if (!err) onChange(next)
  }
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex flex-wrap gap-2">
        {previews.map(({ f, url }, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border">
            <img src={url} alt={f.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              aria-label={`Remove ${f.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {files.length < MAX_PHOTOS && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-primary-400 hover:text-primary-700">
            <ImagePlus className="h-5 w-5" /> Add photo
            <input
              type="file"
              accept={ALLOWED_MIME_TYPES.join(',')}
              multiple
              capture="environment"
              className="sr-only"
              onChange={add}
            />
          </label>
        )}
      </div>
      <p
        className={cx(
          'mt-1 text-xs',
          localError || error ? 'text-red-600' : 'text-gray-500'
        )}
      >
        {localError ||
          error ||
          `Up to ${MAX_PHOTOS} images · JPEG, PNG or WEBP · max 5 MB each`}
      </p>
    </div>
  )
}

const UPDATE_ICON = {
  PROGRESS: Wrench,
  REVIEW: ShieldCheck,
  FEEDBACK: MessageSquare,
  RESOLUTION: CheckCircle2,
  ASSIGNMENT: User,
  COMMENT: MessageSquare,
}

/**
 * Combined chronological timeline of status changes and supervisor/technician updates.
 */
export function ReportTimeline({ report }) {
  const entries = [
    ...(report.history || []).map((h) => ({ kind: 'status', at: h.created_at, ...h })),
    ...(report.updates || []).map((u) => ({ kind: 'update', at: u.created_at, ...u })),
  ].sort((a, b) => a.at.localeCompare(b.at))

  if (!entries.length) return <EmptyState title="No activity yet" />
  return (
    <ol className="relative space-y-5 border-l-2 border-gray-200 pl-6">
      {entries.map((e) => {
        if (e.kind === 'status') {
          return (
            <li key={`s-${e.id}`} className="relative">
              <span className="absolute -left-[33px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-primary-600">
                <Circle className="h-2 w-2 fill-primary-600 text-primary-600" />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={e.to_status} />
                <span className="text-xs text-gray-500">{formatDate(e.created_at)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">
                {e.note || `Status changed to ${STATUS_LABELS[e.to_status]}`}
                {e.actor && (
                  <span className="text-gray-500">
                    {' '}
                    — {e.actor.full_name} ({ROLE_LABELS[e.actor.role]})
                  </span>
                )}
              </p>
            </li>
          )
        }
        const Icon = UPDATE_ICON[e.type] || MessageSquare
        const role = e.author?.role || e.author_role
        return (
          <li key={`u-${e.id}`} className="relative">
            <span
              className={cx(
                'absolute -left-[35px] top-0 flex h-5 w-5 items-center justify-center rounded-full',
                role === 'TECHNICIAN'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-sky-100 text-sky-700'
              )}
            >
              <Icon className="h-3 w-3" />
            </span>
            <div
              className={cx(
                'rounded-lg border p-3 text-sm',
                e.is_internal ? 'border-dashed border-amber-300 bg-amber-50' : 'bg-white'
              )}
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-gray-800">
                  {ROLE_LABELS[role] || 'Staff'} update
                  {e.author ? ` · ${e.author.full_name}` : ''}
                  {e.is_internal && (
                    <span className="ml-2 rounded bg-amber-200 px-1 text-[10px] text-amber-900">
                      Internal
                    </span>
                  )}
                </span>
                <span className="text-gray-500">{formatDate(e.created_at)}</span>
              </div>
              <p className="whitespace-pre-line text-gray-700">{e.message}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function ResolutionPanel({ report }) {
  if (!report.completion_notes && !report.resolved_at && !report.rejection_reason)
    return null
  return (
    <Card
      className={cx(
        report.status === 'REJECTED'
          ? 'border-red-200 bg-red-50/40'
          : report.status === 'RESOLVED'
            ? 'border-emerald-200 bg-emerald-50/40'
            : ''
      )}
    >
      <h2 className="mb-3 text-sm font-bold text-gray-900">
        {report.status === 'REJECTED' ? 'Rejection details' : 'Resolution details'}
      </h2>
      {report.rejection_reason && (
        <p className="text-sm text-red-800">
          <strong>Reason:</strong> {report.rejection_reason}
          {report.reviewer && (
            <span className="text-red-700">
              {' '}
              — {report.reviewer.full_name}, {formatDate(report.reviewed_at)}
            </span>
          )}
        </p>
      )}
      {report.completion_notes && (
        <div className="space-y-1 text-sm">
          <p className="text-xs font-semibold uppercase text-gray-500">
            Technician completion notes
          </p>
          <p className="whitespace-pre-line text-gray-800">{report.completion_notes}</p>
          {report.completed_at && (
            <p className="text-xs text-gray-500">
              Submitted {formatDate(report.completed_at)}
            </p>
          )}
        </div>
      )}
      {report.resolved_at && (
        <p className="mt-3 text-sm text-emerald-800">
          <CheckCircle2 className="mr-1 inline h-4 w-4" />
          Verified{report.verifier ? ` by ${report.verifier.full_name}` : ''} and resolved
          on <strong>{formatDate(report.resolved_at)}</strong>
        </p>
      )}
    </Card>
  )
}

export function AssignmentHistoryList({ assignments }) {
  if (!assignments?.length)
    return <p className="text-sm text-gray-500">No assignments yet.</p>
  return (
    <ul className="space-y-2 text-sm">
      {assignments.map((a) => (
        <li key={a.id} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">{a.technician?.full_name}</span>
            <span
              className={cx(
                'rounded px-2 py-0.5 text-[11px] font-bold',
                a.status === 'ACTIVE'
                  ? 'bg-blue-50 text-blue-700'
                  : a.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
              )}
            >
              {a.status}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Assigned {formatDate(a.assigned_at)}
            {a.assigner ? ` by ${a.assigner.full_name}` : ''}
            {a.accepted_at && ` · accepted ${formatDate(a.accepted_at)}`}
            {a.ended_at && ` · ended ${formatDate(a.ended_at)}`}
          </p>
          {a.instructions && <p className="mt-1 text-gray-700">“{a.instructions}”</p>}
        </li>
      ))}
    </ul>
  )
}
