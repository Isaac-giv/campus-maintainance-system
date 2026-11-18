// apps/client/src/routes/RoleRoute.jsx
// Protected route guard: enforces authentication, account verification, and role permissions.
// Automatically adapts the active persona in development/demo mode when navigating directly via URL.

import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'

export default function RoleRoute({ allowedRoles = [], requireVerification = true }) {
  const { session, profile, loading, switchPersona } = useAuth()
  const location = useLocation()

  // Auto-adapt demo persona when typing or navigating directly to a role-specific URL
  useEffect(() => {
    if (session && allowedRoles.length > 0 && profile) {
      const currentRole = profile?.role || 'STUDENT'
      if (!allowedRoles.includes(currentRole)) {
        // Switch to the first authorized role for this route
        const targetRole = allowedRoles[0]
        switchPersona(targetRole)
      }
    }
  }, [location.pathname, session, profile, allowedRoles, switchPersona])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-700 border-t-transparent" />
          <span className="text-xs text-gray-500 font-medium">Loading session...</span>
        </div>
      </div>
    )
  }

  // 1. Must be logged in
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Must be verified before accessing any dashboard or protected portal
  if (requireVerification && profile && profile.isVerified === false) {
    return <Navigate to="/verify-account" state={{ from: location }} replace />
  }

  // 3. If role doesn't match yet while auto-switching is completing
  const currentRole = profile?.role || 'STUDENT'
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-700 border-t-transparent" />
          <span className="text-xs text-gray-500 font-medium">
            Switching to {allowedRoles[0]} workspace...
          </span>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
