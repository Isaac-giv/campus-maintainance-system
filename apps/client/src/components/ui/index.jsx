// Shared design-system components.

import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, X, AlertTriangle, Inbox, Search } from 'lucide-react'
import { STATUS_LABELS, PRIORITY_LABELS } from '@campus/shared'

export const cx = (...c) => c.filter(Boolean).join(' ')

export const formatDate = (d, withTime = true) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : '—'

export function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(d, false)
}

const STATUS_STYLE = {
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-200',
  APPROVED: 'bg-sky-50 text-sky-800 ring-sky-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  ASSIGNED: 'bg-blue-50 text-blue-800 ring-blue-200',
  ACCEPTED: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  IN_PROGRESS: 'bg-violet-50 text-violet-800 ring-violet-200',
  AWAITING_VERIFICATION: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  RETURNED: 'bg-orange-50 text-orange-800 ring-orange-200',
  RESOLVED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export function StatusBadge({ status }) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        STATUS_STYLE[status]
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

const PRIORITY_STYLE = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-orange-50 text-orange-700',
  URGENT: 'bg-red-600 text-white',
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={cx(
        'inline-flex rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide',
        PRIORITY_STYLE[priority]
      )}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  )
}

export function Button({ variant = 'primary', loading, className, children, ...props }) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-ghost',
  }
  return (
    <button
      className={cx(styles[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Field({ label, error, hint, required, children, htmlFor }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function Card({ className, children, ...p }) {
  return (
    <div className={cx('card', className)} {...p}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, tone = 'primary', to, hint }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    cyan: 'bg-cyan-50 text-cyan-700',
    gray: 'bg-gray-100 text-gray-700',
  }
  const body = (
    <div className="card flex items-center gap-4 p-4 transition hover:shadow-md sm:p-5">
      {Icon && (
        <div className={cx('rounded-xl p-3', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
      <AlertTriangle className="h-6 w-6" />
      <p>{error?.message || 'Failed to load data.'}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <Icon className="h-8 w-8 text-gray-400" />
      <p className="font-semibold text-gray-800">{title}</p>
      {message && <p className="max-w-sm text-sm text-gray-500">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-gray-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl',
          widths[size]
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cx('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        className="input pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  )
}

export function Select({ value, onChange, options, placeholder, className, ...p }) {
  return (
    <select
      className={cx('input', className)}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...p}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-5 w-9 rounded-full transition disabled:opacity-50',
          checked ? 'bg-emerald-500' : 'bg-gray-300'
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </button>
      {label}
    </label>
  )
}

export function Avatar({ name, url, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-20 w-20 text-2xl' }
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')
  return url ? (
    <img src={url} alt={name} className={cx('rounded-full object-cover', sizes[size])} />
  ) : (
    <span
      className={cx(
        'inline-flex items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700',
        sizes[size]
      )}
    >
      {initials}
    </span>
  )
}

export function Table({ columns, rows, rowKey = 'id', onRowClick, empty }) {
  if (!rows?.length) return empty || <EmptyState />
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cx(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600',
                  c.className
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr
              key={r[rowKey]}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx('px-4 py-3 align-top text-gray-800', c.className)}
                >
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
  loading,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">{message}</p>
    </Modal>
  )
}
