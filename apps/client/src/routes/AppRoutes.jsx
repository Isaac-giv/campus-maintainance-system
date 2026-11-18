// apps/client/src/routes/AppRoutes.jsx
// Complete application routing table with Role-Based Access Control and Verification guards
// Landing page (/) defaults to the University Login & Sign Up portal.

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROLES } from '@campus/shared'
import RoleRoute from './RoleRoute.jsx'

// Auth & Verification pages
import LoginPage from '../pages/auth/LoginPage.jsx'
import VerifyAccountPage from '../pages/auth/VerifyAccountPage.jsx'

// Student pages
import StudentDashboardPage from '../pages/student/StudentDashboardPage.jsx'
import CreateReportPage from '../pages/student/CreateReportPage.jsx'
import MyReportsPage from '../pages/student/MyReportsPage.jsx'
import ReportDetailsPage from '../pages/student/ReportDetailsPage.jsx'

// Supervisor pages
import SupervisorDashboardPage from '../pages/supervisor/SupervisorDashboardPage.jsx'
import TriageQueuePage from '../pages/supervisor/TriageQueuePage.jsx'
import VerificationQueuePage from '../pages/supervisor/VerificationQueuePage.jsx'

// Worker pages
import WorkerDashboardPage from '../pages/worker/WorkerDashboardPage.jsx'
import WorkerTaskQueuePage from '../pages/worker/WorkerTaskQueuePage.jsx'
import JobExecutionPage from '../pages/worker/JobExecutionPage.jsx'

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx'
import UserManagementPage from '../pages/admin/UserManagementPage.jsx'
import FacilitySettingsPage from '../pages/admin/FacilitySettingsPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing page: Official University Login & Sign Up Portal */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage initialTab="LOGIN" />} />
      <Route path="/register" element={<LoginPage initialTab="REGISTER" />} />

      {/* Account Verification route (accessible to logged-in users needing verification) */}
      <Route path="/verify-account" element={<VerifyAccountPage />} />

      {/* Student routes — Role-based: STUDENT & ADMIN */}
      <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT, ROLES.ADMIN]} />}>
        <Route path="/student" element={<StudentDashboardPage />} />
        <Route path="/student/reports/new" element={<CreateReportPage />} />
        <Route path="/student/reports" element={<MyReportsPage />} />
        <Route path="/student/reports/:id" element={<ReportDetailsPage />} />
      </Route>

      {/* Supervisor routes — Role-based: SUPERVISOR & ADMIN */}
      <Route element={<RoleRoute allowedRoles={[ROLES.SUPERVISOR, ROLES.ADMIN]} />}>
        <Route path="/supervisor" element={<SupervisorDashboardPage />} />
        <Route path="/supervisor/triage" element={<TriageQueuePage />} />
        <Route path="/supervisor/verify" element={<VerificationQueuePage />} />
      </Route>

      {/* Worker routes — Role-based: WORKER & ADMIN */}
      <Route element={<RoleRoute allowedRoles={[ROLES.WORKER, ROLES.ADMIN]} />}>
        <Route path="/worker" element={<WorkerDashboardPage />} />
        <Route path="/worker/tasks" element={<WorkerTaskQueuePage />} />
        <Route path="/worker/jobs/:id" element={<JobExecutionPage />} />
      </Route>

      {/* Admin routes — Role-based: ADMIN ONLY */}
      <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/facilities" element={<FacilitySettingsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 text-center">
            <h1 className="text-3xl font-bold text-gray-900">404 - Page Not Found</h1>
            <p className="mt-2 text-sm text-gray-600">
              The requested page does not exist.
            </p>
            <a
              href="/"
              className="btn-primary mt-4 inline-flex items-center text-xs py-2 px-4"
            >
              Return to Landing Page
            </a>
          </div>
        }
      />
    </Routes>
  )
}
