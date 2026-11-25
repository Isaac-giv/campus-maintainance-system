import React, { useEffect, useRef, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
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
  ClipboardList,
  Building2,
  Wrench,
  UserCircle,
  History,
  BarChart3,
  Layers,
  HardHat,
  ChevronDown,
} from 'lucide-react'
import { ROLE_LABELS } from '@campus/shared'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'
import { Avatar, cx, timeAgo } from '../ui/index.jsx'
import logo from '../../assets/logo.jpg'

const NAV = {
  STUDENT: [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard, end: true },
    { name: 'Report an Issue', path: '/student/reports/new', icon: FilePlus2 },
    { name: 'My Reports', path: '/student/reports', icon: FileText, end: true },
  ],
  SUPERVISOR: [
    { name: 'Dashboard', path: '/supervisor', icon: LayoutDashboard, end: true },
    { name: 'All Complaints', path: '/supervisor/complaints', icon: ClipboardList },
    { name: 'Verification', path: '/supervisor/verification', icon: CheckCircle2 },
    { name: 'Technicians', path: '/supervisor/technicians', icon: HardHat },
    { name: 'Assignment History', path: '/supervisor/assignments', icon: History },
  ],
  TECHNICIAN: [
    { name: 'Dashboard', path: '/technician', icon: LayoutDashboard, end: true },
    { name: 'My Jobs', path: '/technician/jobs', icon: Wrench, end: true },
    { name: 'Job History', path: '/technician/history', icon: History },
  ],
  ADMIN: [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Departments', path: '/admin/departments', icon: Layers },
    { name: 'Configuration', path: '/admin/configuration', icon: Building2 },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'All Complaints', path: '/supervisor/complaints', icon: ClipboardList },
  ],
}

function useClickOutside(ref, onOut) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOut()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onOut])
}

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(userRef, () => setUserOpen(false))
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => setSidebarOpen(false), [location.pathname])

  const role = profile?.role
  const navItems = NAV[role] || []
  const base = {
    STUDENT: '/student',
    SUPERVISOR: '/supervisor',
    TECHNICIAN: '/technician',
    ADMIN: '/admin',
  }[role]

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const openNotification = (n) => {
    if (!n.is_read) markRead(n.id)
    setNotifOpen(false)
    if (n.report_id) {
      const path =
        role === 'STUDENT'
          ? `/student/reports/${n.report_id}`
          : role === 'TECHNICIAN'
            ? `/technician/jobs/${n.report_id}`
            : `/supervisor/complaints/${n.report_id}`
      navigate(path)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2"
      >
        Skip to content
      </a>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary-900 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-primary-800 p-4">
          <Link to={base || '/'} className="flex items-center gap-3">
            <img
              src={logo}
              alt="Cosmopolitan University"
              className="h-10 w-10 rounded-full border border-accent object-cover"
            />
            <div className="leading-tight">
              <span className="block text-sm font-black">Cosmopolitan</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-accent">
                Maintenance Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-primary-300 hover:bg-primary-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-primary-800 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-200">
          {ROLE_LABELS[role]} Portal
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary-800 text-accent'
                    : 'text-primary-200 hover:bg-primary-800/60 hover:text-white'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
          <div className="my-3 border-t border-primary-800" />
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                isActive
                  ? 'bg-primary-800 text-accent'
                  : 'text-primary-200 hover:bg-primary-800/60'
              )
            }
          >
            <Bell className="h-4 w-4" /> Notifications
            {unreadCount > 0 && (
              <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                isActive
                  ? 'bg-primary-800 text-accent'
                  : 'text-primary-200 hover:bg-primary-800/60'
              )
            }
          >
            <UserCircle className="h-4 w-4" /> My Profile
          </NavLink>
        </nav>
        <div className="border-t border-primary-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-primary-800"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="-ml-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="hidden text-xs font-bold uppercase tracking-wider text-gray-600 sm:block">
                Cosmopolitan University Campus Maintenance
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  aria-label={`Notifications (${unreadCount} unread)`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b px-4 py-2.5">
                      <h3 className="text-sm font-bold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs font-medium text-primary-700 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 divide-y overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="p-4 text-center text-xs text-gray-500">
                          No notifications
                        </p>
                      )}
                      {notifications.slice(0, 8).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => openNotification(n)}
                          className={cx(
                            'block w-full p-3 text-left text-xs hover:bg-gray-50',
                            !n.is_read && 'bg-primary-50/60'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                              {!n.is_read && (
                                <span
                                  className="h-2 w-2 rounded-full bg-primary-600"
                                  aria-label="unread"
                                />
                              )}
                              {n.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-gray-500">
                              {timeAgo(n.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-600">{n.message}</p>
                        </button>
                      ))}
                    </div>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block border-t px-4 py-2 text-center text-xs font-medium text-primary-700 hover:bg-gray-50"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
                  aria-label="Account menu"
                >
                  <Avatar name={profile?.full_name} url={profile?.avatar_url} size="sm" />
                  <div className="hidden text-left sm:block">
                    <div className="text-xs font-bold text-gray-800">
                      {profile?.full_name}
                    </div>
                    <div className="text-[10px] text-gray-600">{ROLE_LABELS[role]}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
                    <div className="border-b px-4 py-2">
                      <p className="truncate text-xs font-bold">{profile?.full_name}</p>
                      <p className="truncate text-[11px] text-gray-600">
                        {profile?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <UserCircle className="h-4 w-4" /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
