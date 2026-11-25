import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AccessDeniedPage() {
  const { state } = useLocation()
  const { signOut } = useAuth()
  const inactive = state?.reason === 'inactive'
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldX className="h-12 w-12 text-red-500" />
      <h1 className="text-2xl font-bold text-gray-900">
        {inactive ? 'Account deactivated' : 'Access denied'}
      </h1>
      <p className="max-w-md text-sm text-gray-600">
        {inactive
          ? 'Your account has been deactivated. Please contact the system administrator.'
          : 'You do not have permission to view this page.'}
      </p>
      <div className="flex gap-2">
        {!inactive && (
          <Link to="/" className="btn-primary">
            Go to my dashboard
          </Link>
        )}
        <button onClick={signOut} className="btn-secondary">
          Sign out
        </button>
      </div>
    </div>
  )
}
