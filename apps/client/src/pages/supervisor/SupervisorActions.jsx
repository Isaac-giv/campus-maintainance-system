// Supervisor action modals: review, triage, assign, verify, status update, comment.

import React, { useMemo, useState } from 'react'
import { PRIORITY_LABELS, STATUS_LABELS, VALID_TRANSITIONS } from '@campus/shared'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  reviewReport,
  triageReport,
  assignTechnician,
  verifyCompletion,
  updateReportStatus,
  addReportUpdate,
  fetchTechnicians,
  fetchCategories,
} from '../../services/api.js'
import { Button, Field, Modal, Select, Toggle, cx } from '../../components/ui/index.jsx'

const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

function useAction(onDone, close) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const run = async (fn, msg) => {
    setBusy(true)
    try {
      await fn()
      toast.success(msg)
      close()
      onDone?.()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  return [busy, run]
}

export function ReviewModal({ report, mode, onClose, onDone }) {
  const approve = mode === 'approve'
  const { data: categories } = useAsync(() => fetchCategories(), [])
  const [reason, setReason] = useState('')
  const [priority, setPriority] = useState(report.priority)
  const [categoryId, setCategoryId] = useState(report.category?.id || '')
  const [err, setErr] = useState('')
  const [busy, run] = useAction(onDone, onClose)

  const submit = () => {
    if (!approve && reason.trim().length < 5)
      return setErr('Provide a rejection reason (at least 5 characters).')
    run(
      () => reviewReport(report.id, approve, { reason, priority, categoryId }),
      approve ? 'Complaint approved.' : 'Complaint rejected.'
    )
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={approve ? 'Approve complaint' : 'Reject complaint'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={approve ? 'success' : 'danger'}
            loading={busy}
            onClick={submit}
          >
            {approve ? 'Approve' : 'Reject'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {approve && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select
                value={categoryId}
                onChange={setCategoryId}
                options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={setPriority} options={priorityOptions} />
            </Field>
          </div>
        )}
        <Field
          label={approve ? 'Note (optional)' : 'Rejection reason'}
          required={!approve}
          error={err}
        >
          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setErr('')
            }}
            placeholder={
              approve
                ? ''
                : 'e.g. Duplicate of CMR-2026-01012 / not a maintenance issue / insufficient detail'
            }
          />
        </Field>
        {!approve && (
          <p className="text-xs text-gray-500">
            The student will be notified with this reason.
          </p>
        )}
      </div>
    </Modal>
  )
}

export function TriageModal({ report, onClose, onDone }) {
  const { data: categories } = useAsync(() => fetchCategories(), [])
  const [priority, setPriority] = useState(report.priority)
  const [categoryId, setCategoryId] = useState(report.category?.id || '')
  const [busy, run] = useAction(onDone, onClose)
  return (
    <Modal
      open
      onClose={onClose}
      title="Categorise & prioritise"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={busy}
            onClick={() =>
              run(
                () => triageReport(report.id, { priority, categoryId }),
                'Complaint updated.'
              )
            }
          >
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <Select
            value={categoryId}
            onChange={setCategoryId}
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
          />
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={setPriority} options={priorityOptions} />
        </Field>
      </div>
    </Modal>
  )
}

export function AssignModal({ report, onClose, onDone }) {
  const { data: techs, loading } = useAsync(() => fetchTechnicians(), [])
  const { data: categories } = useAsync(() => fetchCategories(true), [])
  const [techId, setTechId] = useState('')
  const [priority, setPriority] = useState(report.priority)
  const [instructions, setInstructions] = useState('')
  const [onlyMatching, setOnlyMatching] = useState(true)
  const [busy, run] = useAction(onDone, onClose)
  const isReassign = !!report.current_technician_id

  const requiredSpec = useMemo(
    () => categories?.find((c) => c.id === report.category?.id)?.specialization_id,
    [categories, report.category]
  )
  const list = useMemo(() => {
    const all = (techs || []).map((t) => ({
      ...t,
      matches: !!requiredSpec && t.specializations.some((s) => s.id === requiredSpec),
    }))
    const shown =
      onlyMatching && requiredSpec && all.some((t) => t.matches)
        ? all.filter((t) => t.matches)
        : all
    return shown.sort(
      (a, b) => Number(b.matches) - Number(a.matches) || a.activeJobs - b.activeJobs
    )
  }, [techs, requiredSpec, onlyMatching])

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={isReassign ? 'Reassign technician' : 'Assign technician'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!techId}
            loading={busy}
            onClick={() =>
              run(
                () => assignTechnician(report.id, techId, { instructions, priority }),
                isReassign ? 'Job reassigned.' : 'Technician assigned.'
              )
            }
          >
            {isReassign ? 'Reassign' : 'Assign'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {isReassign && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Currently assigned to <strong>{report.technician?.full_name}</strong>. They
            will be notified the job was moved.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Available technicians</p>
          {requiredSpec && (
            <Toggle
              checked={onlyMatching}
              onChange={setOnlyMatching}
              label="Matching specialization only"
            />
          )}
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && !list.length && (
            <p className="text-sm text-gray-500">No active technicians found.</p>
          )}
          {list.map((t) => (
            <label
              key={t.id}
              className={cx(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm',
                techId === t.id ? 'border-primary-600 bg-primary-50' : 'hover:bg-gray-50',
                t.id === report.current_technician_id && 'opacity-50'
              )}
            >
              <input
                type="radio"
                name="tech"
                className="mt-1"
                checked={techId === t.id}
                disabled={t.id === report.current_technician_id}
                onChange={() => setTechId(t.id)}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{t.full_name}</span>
                  {t.matches && (
                    <span className="rounded bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-800">
                      MATCH
                    </span>
                  )}
                  {t.staff?.is_available === false && (
                    <span className="rounded bg-gray-200 px-1.5 text-[10px] font-bold text-gray-700">
                      UNAVAILABLE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {t.specializations.map((s) => s.name).join(', ') || 'No specialization'}{' '}
                  · {t.department?.name || 'No department'}
                </p>
              </div>
              <span className="text-xs text-gray-600">
                {t.activeJobs} active job{t.activeJobs === 1 ? '' : 's'}
              </span>
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Priority">
            <Select value={priority} onChange={setPriority} options={priorityOptions} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Instructions for technician (optional)">
              <textarea
                className="input"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function VerifyModal({ report, mode, onClose, onDone }) {
  const approve = mode === 'approve'
  const [feedback, setFeedback] = useState('')
  const [err, setErr] = useState('')
  const [busy, run] = useAction(onDone, onClose)
  const submit = () => {
    if (!approve && feedback.trim().length < 5)
      return setErr('Explain what needs correcting (at least 5 characters).')
    run(
      () => verifyCompletion(report.id, approve, feedback),
      approve ? 'Work approved and complaint resolved.' : 'Work returned to technician.'
    )
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={approve ? 'Approve work & resolve' : 'Return for correction'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={approve ? 'success' : 'danger'}
            loading={busy}
            onClick={submit}
          >
            {approve ? 'Approve & resolve' : 'Return work'}
          </Button>
        </>
      }
    >
      <Field
        label={approve ? 'Verification note (optional)' : 'Feedback for technician'}
        required={!approve}
        error={err}
      >
        <textarea
          className="input"
          rows={4}
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value)
            setErr('')
          }}
        />
      </Field>
    </Modal>
  )
}

export function StatusModal({ report, onClose, onDone }) {
  const options = (VALID_TRANSITIONS[report.status] || []).filter((s) => s !== 'ASSIGNED')
  const [status, setStatus] = useState(options[0] || '')
  const [note, setNote] = useState('')
  const [busy, run] = useAction(onDone, onClose)
  return (
    <Modal
      open
      onClose={onClose}
      title="Update status"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!status}
            loading={busy}
            onClick={() =>
              run(() => updateReportStatus(report.id, status, note), 'Status updated.')
            }
          >
            Update
          </Button>
        </>
      }
    >
      {options.length === 0 ? (
        <p className="text-sm text-gray-600">
          No manual status changes are available from{' '}
          <strong>{STATUS_LABELS[report.status]}</strong>.
        </p>
      ) : (
        <div className="space-y-4">
          <Field label="New status">
            <Select
              value={status}
              onChange={setStatus}
              options={options.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
            />
          </Field>
          <Field label="Note" hint="Required when rejecting or returning work.">
            <textarea
              className="input"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
      )}
    </Modal>
  )
}

export function CommentBox({
  reportId,
  onDone,
  allowInternal = true,
  placeholder = 'Add an update…',
}) {
  const toast = useToast()
  const [msg, setMsg] = useState('')
  const [internal, setInternal] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (msg.trim().length < 3) return toast.error('Update must be at least 3 characters.')
    setBusy(true)
    try {
      await addReportUpdate(reportId, msg, internal)
      setMsg('')
      toast.success('Update posted.')
      onDone?.()
    } catch (err) {
      toast.error(err)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        className="input"
        rows={3}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={placeholder}
        maxLength={2000}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        {allowInternal ? (
          <Toggle
            checked={internal}
            onChange={setInternal}
            label="Internal (hidden from student)"
          />
        ) : (
          <span />
        )}
        <Button type="submit" variant="secondary" loading={busy}>
          Post update
        </Button>
      </div>
    </form>
  )
}
