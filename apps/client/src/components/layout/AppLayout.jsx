// apps/client/src/components/layout/AppLayout.jsx
// Main application layout featuring the responsive sidebar, top navbar,
// role-based navigation, notification drawer, verification status, and demo persona switcher.

import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Users,
  CheckCircle2,
  Clock,
  ChevronDown,
  Building2,
  Wrench,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'
import logo from '../../assets/logo.jpg'

export default function AppLayout({ children }) {
  const { profile, signOut, switchPersona } = useAuth()
  const { notifications, unreadCount, markNotificationsAsRead } = useReports()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentRole = profile?.role || 'STUDENT'
  const isVerified = profile?.isVerified !== false

  // Dynamic navigation items based on current role
  const getNavItems = () => {
    switch (currentRole) {
      case 'SUPERVISOR':
        return [
          { name: 'Dashboard', path: '/supervisor', icon: LayoutDashboard },
          { name: 'Triage Queue', path: '/supervisor/triage', icon: Clock },
          { name: 'Verification Queue', path: '/supervisor/verify', icon: CheckCircle2 },
          { name: 'All Reports', path: '/student/reports', icon: FileText },
        ]
      case 'WORKER':
        return [
          { name: 'Dashboard', path: '/worker', icon: LayoutDashboard },
          { name: 'Task Queue', path: '/worker/tasks', icon: Wrench },
          { name: 'All Reports', path: '/student/reports', icon: FileText },
        ]
      case 'ADMIN':
        return [
          { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Reports', path: '/student/reports', icon: FileText },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Maintenance Staff', path: '/supervisor/triage', icon: Wrench },
          { name: 'Facility Settings', path: '/admin/facilities', icon: Building2 },
        ]
      case 'STUDENT':
      default:
        return [
          { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'Report Issue', path: '/student/reports/new', icon: FilePlus2 },
          { name: 'My Reports', path: '/student/reports', icon: FileText },
        ]
    }
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handlePersonaSwitch = (identifier) => {
    switchPersona(identifier)
    if (identifier === 'UNVERIFIED_STUDENT' || identifier === 'usr-student-unverified') {
      navigate('/verify-account')
    } else if (identifier === 'STUDENT') {
      navigate('/student')
    } else if (identifier === 'SUPERVISOR') {
      navigate('/supervisor')
    } else if (identifier === 'WORKER') {
      navigate('/worker')
    } else if (identifier === 'ADMIN') {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-primary-800">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Cosmopolitan University Emblem"
              className="h-10 w-10 rounded-full border border-accent object-cover shadow-sm"
            />
            <div className="leading-tight">
              <span className="text-sm font-black tracking-tight text-white block">
                Cosmopolitan
              </span>
              <span className="text-[10px] font-semibold text-accent tracking-wider uppercase block">
                Maintenance Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role & Verification Badge Header */}
        <div className="px-4 py-2.5 bg-primary-950/60 border-b border-primary-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-200">
              {currentRole} PORTAL
            </span>
          </div>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
              <ShieldCheck className="h-3 w-3" />
              <span>Verified</span>
            </span>
          ) : (
            <Link
              to="/verify-account"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Unverified</span>
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' &&
                location.pathname.startsWith(item.path) &&
                item.path !== '/student' &&
                item.path !== '/worker' &&
                item.path !== '/supervisor' &&
                item.path !== '/admin')

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-800 text-accent shadow-sm border-l-4 border-accent'
                    : 'text-primary-200 hover:bg-primary-800/60 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-accent' : 'text-primary-300'}`}
                />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-primary-800 bg-primary-950/40">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-primary-800/50">
            <img
              src={
                profile?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              }
              alt={profile?.fullName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-primary-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.fullName || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-accent font-medium capitalize">
                  {currentRole.toLowerCase()}
                </p>
                <span className="text-[10px] text-primary-400">•</span>
                <span
                  className={`text-[9px] font-bold ${
                    isVerified ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-primary-800 hover:text-red-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Hamburger for mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-600">
                  Cosmopolitan University Campus Maintenance
                </span>
              </div>
            </div>

            {/* Right side controls: Role switcher, Notifications, Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Demo Role Switcher Pill */}
              <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                <span className="px-2 text-gray-700 font-bold">Role:</span>
                {[
                  { id: 'STUDENT', label: 'Student' },
                  { id: 'SUPERVISOR', label: 'Supervisor' },
                  { id: 'WORKER', label: 'Technician' },
                  { id: 'ADMIN', label: 'Admin' },
                ].map((roleItem) => (
                  <button
                    key={roleItem.id}
                    onClick={() => handlePersonaSwitch(roleItem.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      currentRole === roleItem.id && isVerified
                        ? 'bg-primary-700 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {roleItem.label}
                  </button>
                ))}
                {/* 1-Click Unverified Test Switcher */}
                <button
                  onClick={() => handlePersonaSwitch('UNVERIFIED_STUDENT')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ml-1 ${
                    !isVerified
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                  title="Switch to unverified student to test access block"
                >
                  Unverified Demo
                </button>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markNotificationsAsRead}
                          className="text-xs text-primary-700 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-gray-500">
                          No notifications
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs hover:bg-gray-50 transition-colors ${
                              !notif.isRead ? 'bg-primary-50/50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-gray-600">
                                {notif.time}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-600">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
                >
                  <img
                    src={
                      profile?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={profile?.fullName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-700/20"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-gray-800">
                      {profile?.fullName}
                    </div>
                    <div className="text-[10px] text-gray-600 capitalize">
                      {currentRole.toLowerCase()}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">
                        {profile?.fullName}
                      </p>
                      <p className="text-[10px] text-gray-600 truncate">
                        {profile?.email}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-primary-700">
                          {currentRole}
                        </span>
                        {isVerified ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    {!isVerified && (
                      <Link
                        to="/verify-account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Complete Verification</span>
                      </Link>
                    )}

                    {/* Mobile role switcher inside dropdown */}
                    <div className="md:hidden px-3 py-2 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-600 mb-1">
                        Switch Persona:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        {['STUDENT', 'SUPERVISOR', 'WORKER', 'ADMIN'].map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              handlePersonaSwitch(role)
                              setUserDropdownOpen(false)
                            }}
                            className={`px-2 py-1 rounded text-center font-medium ${
                              currentRole === role
                                ? 'bg-primary-700 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
