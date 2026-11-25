import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { EMAIL_RE } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { Button, Field } from '../../components/ui/index.jsx'
import AuthShell, { FormError } from './AuthShell.jsx'

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    setLoading(true)
    setError('')
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your account email and we will send you a reset link."
      footer={
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-6 text-center text-sm text-gray-700">
          <MailCheck className="h-10 w-10 text-emerald-600" />
          If an account exists for <strong>{email}</strong>, a password reset link has
          been sent.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <FormError message={error} />
          <Field label="Email address" htmlFor="email" required>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
