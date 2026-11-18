// apps/client/src/pages/auth/AccessDeniedPage.jsx
// Displays an authoritative 403 Forbidden security message when a user
// attempts to access a portal outside their authorized role.

import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import logo from '../../assets/logo.jpg'

export default function AccessDeniedPage({ requiredRoles = [] }) {
  const { profile } = useAuth()
  const currentRole = profile?.role || 'STUDENT'

  const getAuthorizedDashboard = (role) => {
    if (role === 'SUPERVISOR') return { path: '/supervisor', label: 'Supervisor Portal' }
    if (role === 'WORKER') return { path: '/worker', label: 'Technician Dashboard' }
    if (role === 'ADMIN') return { path: '/admin', label: 'Admin Dashboard' }
    return { path: '/student', label: 'Student Portal' }
  }

  const authTarget = getAuthorizedDashboard(currentRole)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src={logo}
          alt="Cosmopolitan University"
          className="mx-auto h-20 w-20 rounded-full shadow-md border-2 border-accent object-cover"
        />
        <h2 className="mt-4 text-2xl font-black text-primary-900 tracking-tight">
          Cosmopolitan University
        </h2>
        <p className="text-xs uppercase tracking-wider text-accent font-bold mt-0.5">
          Campus Maintenance Security
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10 text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldX className="h-9 w-9" />
          </div>

          <div>
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-700">
              HTTP 403 — Access Denied
            </span>
            <h3 className="mt-3 text-xl font-extrabold text-gray-900">
              Role Permission Required
            </h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
              You are signed in as a{' '}
              <span className="font-bold text-primary-800">{currentRole}</span>. This
              facility area is restricted to authorized{' '}
              <span className="font-bold text-gray-800">
                {requiredRoles.join(' or ') || 'Staff'}
              </span>{' '}
              personnel only.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Authenticated User:</span>
              <span className="font-bold text-gray-900">{profile?.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Assigned Role:</span>
              <span className="font-mono font-bold text-primary-700">{currentRole}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Permitted Roles:</span>
              <span className="font-mono text-red-600">
                {requiredRoles.join(', ') || 'N/A'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={authTarget.path}
              className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to {authTarget.label}</span>
            </Link>
            <Link
              to="/student/reports"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>View Public Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
