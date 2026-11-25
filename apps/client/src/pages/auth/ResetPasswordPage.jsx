import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validatePassword } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { Button, Field, Spinner } from '../../components/ui/index.jsx'
import AuthShell, { FormError } from './AuthShell.jsx'

export default function ResetPasswordPage() {
  const { session, loading: authLoading, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (authLoading) return <Spinner />

  if (!session) {
    return (
      <AuthShell title="Reset link invalid">
        <p className="text-sm text-gray-700">
          This password reset link is invalid or has expired.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-4">
          Request a new link
        </Link>
      </AuthShell>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    const err = validatePassword(pw) || (pw !== pw2 ? 'Passwords do not match.' : null)
    if (err) return setError(err)
    setLoading(true)
    try {
      await updatePassword(pw)
      await signOut()
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. Please sign in with your new password.' },
      })
    } catch (e2) {
      setError(e2.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field
          label="New password"
          hint="At least 8 characters with letters and numbers."
          htmlFor="pw"
          required
        >
          <input
            id="pw"
            type="password"
            className="input"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw2" required>
          <input
            id="pw2"
            type="password"
            className="input"
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
    </AuthShell>
  )
}
