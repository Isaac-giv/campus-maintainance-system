// Generic admin CRUD section for reference tables.

import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '../../components/ui/Toast.jsx'
import { saveRecord, deleteRecord } from '../../services/api.js'
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  Modal,
  Select,
  Table,
  Toggle,
} from '../../components/ui/index.jsx'

/**
 * fields: [{ key, label, type: 'text'|'textarea'|'select', options?, required?, placeholder? }]
 * columns: Table columns (an actions column is appended)
 */
export default function CrudSection({
  title,
  description,
  table,
  rows,
  fields,
  columns,
  onChanged,
  defaults = {},
  toRecord,
}) {
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const open = (row) => {
    setErrors({})
    setEditing(row ? { ...row } : { is_active: true, ...defaults })
  }

  const save = async () => {
    const e = {}
    fields.forEach((f) => {
      if (f.required && !String(editing[f.key] ?? '').trim()) e[f.key] = 'Required.'
    })
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      const rec = { id: editing.id, is_active: editing.is_active }
      fields.forEach((f) => {
        const v = editing[f.key]
        rec[f.key] = typeof v === 'string' ? v.trim() || null : (v ?? null)
      })
      await saveRecord(table, toRecord ? toRecord(rec) : rec)
      toast.success(`${title.replace(/s$/, '')} saved.`)
      setEditing(null)
      onChanged()
    } catch (err) {
      toast.error(err)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await deleteRecord(table, deleting.id)
      toast.success('Deleted.')
      onChanged()
    } catch (err) {
      toast.error(
        err.code === '23503' ? 'This record is in use. Deactivate it instead.' : err
      )
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  const quickToggle = async (row) => {
    try {
      await saveRecord(table, { id: row.id, is_active: !row.is_active })
      onChanged()
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <Button onClick={() => open(null)}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
      <Table
        rows={rows}
        columns={[
          ...columns,
          {
            key: '_active',
            label: 'Active',
            render: (r) => (
              <Toggle checked={r.is_active} onChange={() => quickToggle(r)} />
            ),
          },
          {
            key: '_x',
            label: '',
            render: (r) => (
              <div className="flex justify-end gap-1">
                <button
                  className="rounded p-1.5 hover:bg-gray-100"
                  title="Edit"
                  onClick={() => open(r)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="rounded p-1.5 text-red-600 hover:bg-red-50"
                  title="Delete"
                  onClick={() => setDeleting(r)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
      {editing && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={`${editing.id ? 'Edit' : 'Add'} ${title.replace(/s$/, '').toLowerCase()}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button loading={busy} onClick={save}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                required={f.required}
                error={errors[f.key]}
              >
                {f.type === 'select' ? (
                  <Select
                    value={editing[f.key] || ''}
                    onChange={(v) => setEditing({ ...editing, [f.key]: v })}
                    placeholder={f.placeholder ?? 'None'}
                    options={f.options}
                  />
                ) : f.type === 'textarea' ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={editing[f.key] || ''}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    className="input"
                    value={editing[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                )}
              </Field>
            ))}
            <Toggle
              checked={!!editing.is_active}
              onChange={(v) => setEditing({ ...editing, is_active: v })}
              label="Active"
            />
          </div>
        </Modal>
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete record"
        variant="danger"
        confirmLabel="Delete"
        loading={busy}
        message={`Delete "${deleting?.name}"? Records in use cannot be deleted — deactivate them instead.`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </Card>
  )
}
