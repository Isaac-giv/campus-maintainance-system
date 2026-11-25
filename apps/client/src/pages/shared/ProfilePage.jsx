import React, { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import {
  ROLE_LABELS,
  PHONE_RE,
  validatePassword,
  ALLOWED_MIME_TYPES,
} from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchBuildings, updateMyProfile, uploadAvatar } from '../../services/api.js'
import {
  Avatar,
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Toggle,
  formatDate,
} from '../../components/ui/index.jsx'

export default function ProfilePage() {
  const { profile, refreshProfile, updatePassword } = useAuth()
  const toast = useToast()
  const isStudent = profile.role === 'STUDENT'
  const { data: buildings } = useAsync(
    () => (isStudent ? fetchBuildings() : Promise.resolve([])),
    [isStudent]
  )
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    setForm({
      fullName: profile.full_name || '',
      phone: profile.phone || '',
      avatarUrl: profile.avatar_url || '',
      matricNumber: profile.student?.matric_number || '',
      programme: profile.student?.programme || '',
      level: profile.student?.level || '',
      buildingId: profile.student?.building_id || '',
      roomNumber: profile.student?.room_number || '',
      jobTitle: profile.staff?.job_title || '',
      isAvailable: profile.staff?.is_available ?? true,
    })
  }, [profile])

  if (!form) return null
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))

  const save = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.fullName.trim().length < 2) errs.fullName = 'Enter your full name.'
    if (form.phone && !PHONE_RE.test(form.phone.trim()))
      errs.phone = 'Invalid phone number.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await updateMyProfile(form)
      await refreshProfile()
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const onAvatar = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_MIME_TYPES.includes(file.type) || file.size > 2 * 1024 * 1024) {
      return toast.error('Profile photo must be a JPEG, PNG or WEBP image under 2 MB.')
    }
    try {
      const url = await uploadAvatar(profile.id, file)
      await updateMyProfile({ ...form, avatarUrl: url })
      await refreshProfile()
      toast.success('Profile photo updated.')
    } catch (err) {
      toast.error(err)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    const err =
      validatePassword(pw.next) ||
      (pw.next !== pw.confirm ? 'Passwords do not match.' : null)
    if (err) return toast.error(err)
    setPwSaving(true)
    try {
      await updatePassword(pw.next)
      setPw({ next: '', confirm: '' })
      toast.success('Password changed.')
    } catch (e2) {
      toast.error(e2)
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        subtitle="Manage your personal details and account security."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Avatar name={profile.full_name} url={profile.avatar_url} size="lg" />
            <label
              className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary-700 p-1.5 text-white shadow"
              title="Change photo"
            >
              <Camera className="h-3.5 w-3.5" />
              <input
                type="file"
                accept={ALLOWED_MIME_TYPES.join(',')}
                className="sr-only"
                onChange={onAvatar}
              />
            </label>
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile.full_name}</p>
            <p className="text-sm text-gray-600">{profile.email}</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
            {ROLE_LABELS[profile.role]}
          </span>
          <dl className="w-full space-y-1 border-t pt-3 text-left text-sm">
            {profile.department && <Row k="Department" v={profile.department.name} />}
            {profile.staff?.staff_number && (
              <Row k="Staff number" v={profile.staff.staff_number} />
            )}
            {isStudent && (
              <Row k="Matric number" v={profile.student?.matric_number || '—'} />
            )}
            {profile.specializations?.length > 0 && (
              <Row
                k="Specializations"
                v={profile.specializations.map((s) => s.specialization?.name).join(', ')}
              />
            )}
            <Row k="Member since" v={formatDate(profile.created_at, false)} />
          </dl>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-bold">Personal details</h2>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Field label="Full name" error={errors.fullName} required>
                <input
                  className="input"
                  value={form.fullName}
                  onChange={set('fullName')}
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  className="input"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                />
              </Field>
              {isStudent && (
                <>
                  <Field
                    label="Matriculation number"
                    hint={
                      profile.student?.matric_number
                        ? 'Contact the administrator to change.'
                        : undefined
                    }
                  >
                    <input
                      className="input uppercase"
                      value={form.matricNumber}
                      disabled={!!profile.student?.matric_number}
                      onChange={set('matricNumber')}
                    />
                  </Field>
                  <Field label="Programme">
                    <input
                      className="input"
                      value={form.programme}
                      onChange={set('programme')}
                    />
                  </Field>
                  <Field label="Level">
                    <Select
                      value={form.level}
                      onChange={set('level')}
                      placeholder="Select"
                      options={['100', '200', '300', '400', '500', 'PG'].map((l) => ({
                        value: l,
                        label: l,
                      }))}
                    />
                  </Field>
                  <Field label="Hostel">
                    <Select
                      value={form.buildingId}
                      onChange={set('buildingId')}
                      placeholder="Not in a hostel"
                      options={(buildings || [])
                        .filter((b) => b.type === 'HOSTEL')
                        .map((b) => ({ value: b.id, label: b.name }))}
                    />
                  </Field>
                  <Field label="Room number">
                    <input
                      className="input"
                      value={form.roomNumber}
                      onChange={set('roomNumber')}
                    />
                  </Field>
                </>
              )}
              {!isStudent && (
                <Field label="Job title">
                  <input
                    className="input"
                    value={form.jobTitle}
                    onChange={set('jobTitle')}
                  />
                </Field>
              )}
              {profile.role === 'TECHNICIAN' && (
                <div className="flex items-end">
                  <Toggle
                    checked={form.isAvailable}
                    onChange={set('isAvailable')}
                    label="Available for new jobs"
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 font-bold">Change password</h2>
            <form
              onSubmit={changePassword}
              className="grid gap-4 sm:grid-cols-2"
              noValidate
            >
              <Field
                label="New password"
                hint="At least 8 characters with letters and numbers."
              >
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" variant="secondary" loading={pwSaving}>
                  Update password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500">{k}</dt>
      <dd className="text-right font-medium text-gray-800">{v}</dd>
    </div>
  )
}
