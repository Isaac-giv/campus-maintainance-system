// Lightweight dependency-free SVG/CSS charts.

import React from 'react'

export function BarList({ items, color = 'bg-primary-600', empty = 'No data' }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <p className="text-sm text-gray-500">{empty}</p>
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="text-sm">
          <div className="mb-0.5 flex justify-between gap-2">
            <span className="truncate text-gray-700">{i.label}</span>
            <span className="font-semibold text-gray-900">{i.value}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full ${i.color || color}`}
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Donut({ segments, size = 140, label }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = 50
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {total > 0 &&
          segments.map((s) => {
            const len = (s.value / total) * c
            const el = (
              <circle
                key={s.label}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 60 60)"
              />
            )
            offset += len
            return el
          })}
        <text
          x="60"
          y="58"
          textAnchor="middle"
          className="fill-gray-900 text-xl font-bold"
        >
          {total}
        </text>
        <text x="60" y="74" textAnchor="middle" className="fill-gray-500 text-[9px]">
          total
        </text>
      </svg>
      <ul className="space-y-1 text-xs">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="text-gray-700">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

export function MonthlyBars({ data }) {
  if (!data?.length)
    return <p className="text-sm text-gray-500">No data for this period.</p>
  const max = Math.max(1, ...data.map((d) => d.submitted))
  return (
    <div>
      <div className="flex h-40 items-end gap-2 overflow-x-auto">
        {data.map((d) => (
          <div
            key={d.month}
            className="flex min-w-[36px] flex-1 flex-col items-center gap-1"
          >
            <div className="flex h-32 w-full items-end justify-center gap-0.5">
              <div
                className="w-1/2 rounded-t bg-primary-500"
                style={{ height: `${(d.submitted / max) * 100}%` }}
                title={`${d.submitted} submitted`}
              />
              <div
                className="w-1/2 rounded-t bg-emerald-500"
                style={{ height: `${(d.resolved / max) * 100}%` }}
                title={`${d.resolved} resolved`}
              />
            </div>
            <span className="text-[10px] text-gray-500">{d.month.slice(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary-500" />
          Submitted
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Resolved
        </span>
      </div>
    </div>
  )
}

export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  APPROVED: '#0ea5e9',
  REJECTED: '#ef4444',
  ASSIGNED: '#3b82f6',
  ACCEPTED: '#6366f1',
  IN_PROGRESS: '#8b5cf6',
  AWAITING_VERIFICATION: '#06b6d4',
  RETURNED: '#f97316',
  RESOLVED: '#22c55e',
  CANCELLED: '#9ca3af',
}
