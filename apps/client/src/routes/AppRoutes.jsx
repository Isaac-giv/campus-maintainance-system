import React, { Suspense, lazy } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import { ProtectedRoute, GuestRoute, HomeRedirect } from './RoleRoute.jsx'
import { Spinner } from '../components/ui/index.jsx'

import LoginPage from '../pages/auth/LoginPage.jsx'
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage.jsx'))
const AccessDeniedPage = lazy(() => import('../pages/auth/AccessDeniedPage.jsx'))
const ProfilePage = lazy(() => import('../pages/shared/ProfilePage.jsx'))
const NotificationsPage = lazy(() => import('../pages/shared/NotificationsPage.jsx'))

const StudentDashboardPage = lazy(
  () => import('../pages/student/StudentDashboardPage.jsx')
)
const CreateReportPage = lazy(() => import('../pages/student/CreateReportPage.jsx'))
const MyReportsPage = lazy(() => import('../pages/student/MyReportsPage.jsx'))
const ReportDetailsPage = lazy(() => import('../pages/student/ReportDetailsPage.jsx'))

const SupervisorDashboardPage = lazy(
  () => import('../pages/supervisor/SupervisorDashboardPage.jsx')
)
const ComplaintsPage = lazy(() => import('../pages/supervisor/ComplaintsPage.jsx'))
const ComplaintDetailsPage = lazy(
  () => import('../pages/supervisor/ComplaintDetailsPage.jsx')
)
const VerificationQueuePage = lazy(
  () => import('../pages/supervisor/VerificationQueuePage.jsx')
)
const TechniciansPage = lazy(() => import('../pages/supervisor/TechniciansPage.jsx'))
const AssignmentHistoryPage = lazy(
  () => import('../pages/supervisor/AssignmentHistoryPage.jsx')
)

const TechnicianDashboardPage = lazy(
  () => import('../pages/technician/TechnicianDashboardPage.jsx')
)
const JobsPage = lazy(() => import('../pages/technician/JobsPage.jsx'))
const JobDetailsPage = lazy(() => import('../pages/technician/JobDetailsPage.jsx'))
const JobHistoryPage = lazy(() => import('../pages/technician/JobHistoryPage.jsx'))

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage.jsx'))
const DepartmentsPage = lazy(() => import('../pages/admin/DepartmentsPage.jsx'))
const ConfigurationPage = lazy(() => import('../pages/admin/ConfigurationPage.jsx'))
const ReportsAnalyticsPage = lazy(() => import('../pages/admin/ReportsAnalyticsPage.jsx'))

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-black text-primary-700">404</p>
      <p className="text-gray-600">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary">
        Go home
      </Link>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route element={<ProtectedRoute roles={['STUDENT']} />}>
              <Route path="/student" element={<StudentDashboardPage />} />
              <Route path="/student/reports" element={<MyReportsPage />} />
              <Route path="/student/reports/new" element={<CreateReportPage />} />
              <Route path="/student/reports/:id" element={<ReportDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['SUPERVISOR', 'ADMIN']} />}>
              <Route path="/supervisor/complaints" element={<ComplaintsPage />} />
              <Route
                path="/supervisor/complaints/:id"
                element={<ComplaintDetailsPage />}
              />
              <Route
                path="/supervisor/verification"
                element={<VerificationQueuePage />}
              />
              <Route path="/supervisor/technicians" element={<TechniciansPage />} />
              <Route path="/supervisor/assignments" element={<AssignmentHistoryPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['SUPERVISOR']} />}>
              <Route path="/supervisor" element={<SupervisorDashboardPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['TECHNICIAN']} />}>
              <Route path="/technician" element={<TechnicianDashboardPage />} />
              <Route path="/technician/jobs" element={<JobsPage />} />
              <Route path="/technician/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/technician/history" element={<JobHistoryPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route path="/admin/configuration" element={<ConfigurationPage />} />
              <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
