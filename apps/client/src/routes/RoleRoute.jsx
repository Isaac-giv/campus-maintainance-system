import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROLE_HOME } from '@campus/shared'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner } from '../components/ui/index.jsx'

/** Requires a signed-in, active user. Optionally restricts to roles. */
export function ProtectedRoute({ roles }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading || (session && !profile)) {
    // Profile still loading after sign-in.
    if (!loading && session && !profile) return <Spinner label="Loading your profile…" />
    return <Spinner />
  }
  if (!session)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!profile.is_active)
    return <Navigate to="/access-denied" replace state={{ reason: 'inactive' }} />
  if (roles && !roles.includes(profile.role))
    return <Navigate to="/access-denied" replace />
  return <Outlet />
}

/** For login/register pages: redirect signed-in users to their home. */
export function GuestRoute() {
  const { session, profile, loading, recovery } = useAuth()
  if (loading) return <Spinner />
  if (session && profile?.is_active && !recovery)
    return <Navigate to={ROLE_HOME[profile.role]} replace />
  return <Outlet />
}

export function HomeRedirect() {
  const { session, profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Spinner label="Loading your profile…" />
  return <Navigate to={ROLE_HOME[profile.role]} replace />
}
