import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Pencil, KeyRound, Power } from 'lucide-react'
import { ROLES, ROLE_LABELS, EMAIL_RE, PHONE_RE, validatePassword } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  fetchUsers,
  fetchDepartments,
  fetchBuildings,
  fetchSpecializations,
  adminCreateUser,
  adminUpdateUser,
  adminSetActive,
  adminSetSpecializations,
  adminSendPasswordReset,
  adminSetPassword,
} from '../../services/api.js'
import {
  Avatar,
  Button,
  ConfirmDialog,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
  Table,
  cx,
  formatDate,
} from '../../components/ui/index.jsx'

const roleOptions = Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] }))

function UserForm({ user, refs, onClose, onDone }) {
  const toast = useToast()
  const isNew = !user
  const [f, setF] = useState(() => ({
    id: user?.id,
    email: user?.email || '',
    fullName: user?.full_name || '',
    role: user?.role || 'STUDENT',
    departmentId: user?.department_id || '',
    phone: user?.phone || '',
    isActive: user?.is_active ?? true,
    staffNumber: user?.staff?.staff_number || '',
    jobTitle: user?.staff?.job_title || '',
    matricNumber: user?.student?.matric_number || '',
    buildingId: user?.student?.building_id || '',
    roomNumber: user?.student?.room_number || '',
    password: '',
    specIds: (user?.specializations || []).map((s) => s.specialization_id),
  }))
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }))

  const save = async () => {
    const e = {}
    if (f.fullName.trim().length < 2) e.fullName = 'Required.'
    if (isNew && !EMAIL_RE.test(f.email.trim())) e.email = 'Valid email required.'
    if (f.phone && !PHONE_RE.test(f.phone)) e.phone = 'Invalid phone.'
    if (isNew && f.password) {
      const pe = validatePassword(f.password)
      if (pe) e.password = pe
    }
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      let id = f.id
      if (isNew) {
        const res = await adminCreateUser({
          email: f.email,
          password: f.password || undefined,
          fullName: f.fullName,
          role: f.role,
          departmentId: f.departmentId || null,
          phone: f.phone || null,
          staffNumber: f.staffNumber || null,
          jobTitle: f.jobTitle || null,
          matricNumber: f.matricNumber || null,
          buildingId: f.buildingId || null,
          roomNumber: f.roomNumber || null,
        })
        id = res.id
      } else {
        await adminUpdateUser(f)
      }
      if (f.role === 'TECHNICIAN') await adminSetSpecializations(id, f.specIds)
      toast.success(
        isNew
          ? f.password
            ? 'User created.'
            : 'User created. A password setup email has been sent.'
          : 'User updated.'
      )
      onDone()
      onClose()
    } catch (err) {
      toast.error(err)
    } finally {
      setBusy(false)
    }
  }

  const staff = f.role !== 'STUDENT'
  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={isNew ? 'Register user' : `Edit ${user.full_name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={save}>
            {isNew ? 'Create user' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName}>
          <input className="input" value={f.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Email" required={isNew} error={errors.email}>
          <input
            className="input"
            type="email"
            value={f.email}
            disabled={!isNew}
            onChange={set('email')}
          />
        </Field>
        <Field label="Role" required>
          <Select value={f.role} onChange={set('role')} options={roleOptions} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className="input" value={f.phone} onChange={set('phone')} />
        </Field>
        {staff && (
          <>
            <Field label="Department">
              <Select
                value={f.departmentId}
                onChange={set('departmentId')}
                placeholder="None (campus-wide)"
                options={refs.departments.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Field>
            <Field label="Staff number">
              <input
                className="input"
                value={f.staffNumber}
                onChange={set('staffNumber')}
              />
            </Field>
            <Field label="Job title">
              <input className="input" value={f.jobTitle} onChange={set('jobTitle')} />
            </Field>
          </>
        )}
        {!staff && (
          <>
            <Field label="Matric number">
              <input
                className="input uppercase"
                value={f.matricNumber}
                onChange={set('matricNumber')}
              />
            </Field>
            <Field label="Hostel">
              <Select
                value={f.buildingId}
                onChange={set('buildingId')}
                placeholder="None"
                options={refs.buildings
                  .filter((b) => b.type === 'HOSTEL')
                  .map((b) => ({ value: b.id, label: b.name }))}
              />
            </Field>
            <Field label="Room number">
              <input
                className="input"
                value={f.roomNumber}
                onChange={set('roomNumber')}
              />
            </Field>
          </>
        )}
        {isNew && (
          <Field
            label="Initial password (optional)"
            error={errors.password}
            hint="Leave blank to email the user a link to set their own password."
          >
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={f.password}
              onChange={set('password')}
            />
          </Field>
        )}
        {f.role === 'TECHNICIAN' && (
          <div className="sm:col-span-2">
            <p className="mb-1 text-sm font-medium text-gray-700">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {refs.specializations.map((s) => {
                const on = f.specIds.includes(s.id)
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() =>
                      set('specIds')(
                        on ? f.specIds.filter((x) => x !== s.id) : [...f.specIds, s.id]
                      )
                    }
                    className={cx(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      on
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    {s.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function AccessModal({ user, onClose }) {
  const toast = useToast()
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(null)
  const run = async (key, fn, msg) => {
    setBusy(key)
    try {
      await fn()
      toast.success(msg)
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }
  return (
    <Modal open onClose={onClose} title={`Reset access — ${user.full_name}`}>
      <div className="space-y-5">
        <div>
          <p className="text-sm text-gray-700">
            Send a password reset link to <strong>{user.email}</strong>.
          </p>
          <Button
            className="mt-2"
            variant="secondary"
            loading={busy === 'link'}
            onClick={() =>
              run('link', () => adminSendPasswordReset(user.id), 'Reset email sent.')
            }
          >
            Send reset email
          </Button>
        </div>
        <div className="border-t pt-4">
          <Field
            label="Or set a temporary password"
            hint="Share it securely; the user should change it after signing in."
          >
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </Field>
          <Button
            className="mt-2"
            loading={busy === 'pw'}
            onClick={() => {
              const err = validatePassword(pw)
              if (err) return toast.error(err)
              run('pw', () => adminSetPassword(user.id, pw), 'Temporary password set.')
            }}
          >
            Set password
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function UserManagementPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const role = params.get('role') || ''
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // user | 'new'
  const [access, setAccess] = useState(null)
  const [toggle, setToggle] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        fetchUsers(),
        fetchDepartments(),
        fetchBuildings(),
        fetchSpecializations(),
      ]),
    []
  )
  const [users, departments, buildings, specializations] = data || [[], [], [], []]
  const refs = { departments, buildings, specializations }

  const rows = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        (!role || u.role === role) &&
        (!status || String(u.is_active) === status) &&
        (!q ||
          [u.full_name, u.email, u.student?.matric_number, u.staff?.staff_number].some(
            (s) => s?.toLowerCase().includes(q)
          ))
    )
  }, [users, role, status, search])

  const doToggle = async () => {
    setBusy(true)
    try {
      await adminSetActive(toggle.id, !toggle.is_active)
      toast.success(toggle.is_active ? 'Account deactivated.' : 'Account activated.')
      setToggle(null)
      reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="User management"
        subtitle="Register users, assign roles, and manage account access."
        actions={
          <Button onClick={() => setEditing('new')}>
            <UserPlus className="mr-1 h-4 w-4" /> Register user
          </Button>
        }
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search name, email, matric/staff no…"
        />
        <Select
          value={role}
          onChange={(v) => setParams(v ? { role: v } : {}, { replace: true })}
          placeholder="All roles"
          options={roleOptions}
        />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="All statuses"
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Deactivated' },
          ]}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-500">
            {rows.length} of {users.length} users
          </p>
          <Table
            rows={rows}
            columns={[
              {
                key: 'u',
                label: 'User',
                render: (u) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={u.full_name} url={u.avatar_url} size="sm" />
                    <div>
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'r',
                label: 'Role',
                render: (u) => (
                  <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-800">
                    {ROLE_LABELS[u.role]}
                  </span>
                ),
              },
              {
                key: 'd',
                label: 'Department / ID',
                render: (u) => (
                  <span className="text-xs">
                    {u.role === 'STUDENT'
                      ? u.student?.matric_number || '—'
                      : u.department?.name || '—'}
                  </span>
                ),
              },
              {
                key: 'a',
                label: 'Status',
                render: (u) =>
                  u.is_active ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Deactivated
                    </span>
                  ),
              },
              {
                key: 'c',
                label: 'Joined',
                className: 'whitespace-nowrap',
                render: (u) => formatDate(u.created_at, false),
              },
              {
                key: 'x',
                label: '',
                render: (u) => (
                  <div className="flex justify-end gap-1">
                    <button
                      className="rounded p-1.5 hover:bg-gray-100"
                      title="Edit"
                      onClick={() => setEditing(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded p-1.5 hover:bg-gray-100"
                      title="Reset access"
                      onClick={() => setAccess(u)}
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    {u.id !== profile.id && (
                      <button
                        className={cx(
                          'rounded p-1.5',
                          u.is_active
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        )}
                        title={u.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => setToggle(u)}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </>
      )}
      {editing && (
        <UserForm
          user={editing === 'new' ? null : editing}
          refs={refs}
          onClose={() => setEditing(null)}
          onDone={reload}
        />
      )}
      {access && <AccessModal user={access} onClose={() => setAccess(null)} />}
      <ConfirmDialog
        open={!!toggle}
        title={toggle?.is_active ? 'Deactivate account' : 'Activate account'}
        message={
          toggle?.is_active
            ? `${toggle?.full_name} will be signed out and blocked from the system.`
            : `${toggle?.full_name} will regain access.`
        }
        confirmLabel={toggle?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggle?.is_active ? 'danger' : 'success'}
        loading={busy}
        onConfirm={doToggle}
        onClose={() => setToggle(null)}
      />
    </div>
  )
}
