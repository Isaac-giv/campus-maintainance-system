import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { validateRegistration } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { fetchBuildings } from '../../services/api.js'
import { Button, Field, Select } from '../../components/ui/index.jsx'
import AuthShell, { FormError } from './AuthShell.jsx'

const EMPTY = {
  fullName: '',
  email: '',
  matricNumber: '',
  phone: '',
  programme: '',
  level: '',
  buildingId: '',
  roomNumber: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { data: buildings } = useAsync(() => fetchBuildings(), [])
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))

  const submit = async (e) => {
    e.preventDefault()
    const errs = validateRegistration(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setError('')
    try {
      const { needsConfirmation } = await signUp(form)
      if (needsConfirmation) setDone(true)
      else navigate('/student', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-6 text-center">
          <MailCheck className="h-10 w-10 text-emerald-600" />
          <p className="text-sm text-gray-700">
            We sent a confirmation link to <strong>{form.email}</strong>. Confirm your
            email, then sign in.
          </p>
          <Link to="/login" className="btn-primary">
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  const hostels = (buildings || []).filter((b) => b.type === 'HOSTEL')

  return (
    <AuthShell
      wide
      title="Student registration"
      subtitle="Staff accounts are created by the system administrator."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <FormError message={error} />
        </div>
        <Field label="Full name" error={errors.fullName} required htmlFor="fn">
          <input
            id="fn"
            className="input"
            autoComplete="name"
            value={form.fullName}
            onChange={set('fullName')}
          />
        </Field>
        <Field label="Email address" error={errors.email} required htmlFor="em">
          <input
            id="em"
            type="email"
            className="input"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
          />
        </Field>
        <Field
          label="Matriculation number"
          error={errors.matricNumber}
          required
          htmlFor="mn"
        >
          <input
            id="mn"
            className="input uppercase"
            value={form.matricNumber}
            onChange={set('matricNumber')}
          />
        </Field>
        <Field label="Phone number" error={errors.phone} htmlFor="ph">
          <input
            id="ph"
            type="tel"
            className="input"
            autoComplete="tel"
            value={form.phone}
            onChange={set('phone')}
          />
        </Field>
        <Field label="Programme" htmlFor="pg">
          <input
            id="pg"
            className="input"
            value={form.programme}
            onChange={set('programme')}
            placeholder="e.g. Computer Science"
          />
        </Field>
        <Field label="Level" htmlFor="lv">
          <Select
            id="lv"
            value={form.level}
            onChange={set('level')}
            placeholder="Select level"
            options={['100', '200', '300', '400', '500', 'PG'].map((l) => ({
              value: l,
              label: l,
            }))}
          />
        </Field>
        <Field label="Hostel (optional)" htmlFor="hb">
          <Select
            id="hb"
            value={form.buildingId}
            onChange={set('buildingId')}
            placeholder="Not in a hostel"
            options={hostels.map((b) => ({ value: b.id, label: b.name }))}
          />
        </Field>
        <Field label="Room number (optional)" htmlFor="rn">
          <input
            id="rn"
            className="input"
            value={form.roomNumber}
            onChange={set('roomNumber')}
          />
        </Field>
        <Field
          label="Password"
          error={errors.password}
          hint="At least 8 characters with letters and numbers."
          required
          htmlFor="pw"
        >
          <input
            id="pw"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
          />
        </Field>
        <Field
          label="Confirm password"
          error={errors.confirmPassword}
          required
          htmlFor="pw2"
        >
          <input
            id="pw2"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </div>
      </form>
    </AuthShell>
  )
}
