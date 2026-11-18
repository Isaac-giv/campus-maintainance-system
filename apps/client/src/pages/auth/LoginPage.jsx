// apps/client/src/pages/auth/LoginPage.jsx
// Complete Landing Page featuring Login & Sign Up tabbed portal
// Strictly conforms to Cosmopolitan University branding and reference UI mockups.

import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Building,
  DoorClosed,
  ArrowRight,
  Sparkles,
  GraduationCap,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'
import logo from '../../assets/logo.jpg'

export default function LoginPage({ initialTab }) {
  const location = useLocation()
  const isRegisterRoute = initialTab === 'REGISTER' || location.pathname === '/register'

  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'REGISTER' : 'LOGIN')
  const { session, profile, login, register, signOut, switchPersona } = useAuth()
  const { hostelBlocks } = useReports()
  const navigate = useNavigate()

  // Sign In Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign Up Form State
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regMatric, setRegMatric] = useState('')
  const [regDept, setRegDept] = useState('')
  const [regHostel, setRegHostel] = useState('Hostel Block A')
  const [regRoom, setRegRoom] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getDashboardPath = (role) => {
    if (role === 'SUPERVISOR') return '/supervisor'
    if (role === 'WORKER') return '/worker'
    if (role === 'ADMIN') return '/admin'
    return '/student'
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      if (result.user?.isVerified === false) {
        navigate('/verify-account')
        return
      }
      navigate(getDashboardPath(result.user?.role))
    } else {
      setError(result.error || 'Failed to sign in. Please verify credentials.')
    }
  }

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!regFullName || !regEmail || !regPassword || !regRoom) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)
    const result = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      matricNumber: regMatric,
      department: regDept,
      hostelBlock: regHostel,
      roomNumber: regRoom,
    })
    setLoading(false)
    if (result.success) {
      navigate('/verify-account')
    } else {
      setError(result.error || 'Registration failed.')
    }
  }

  // Quick Demo Auto-fill for registration testing
  const handleDemoFill = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000)
    setRegFullName('Kemi Adeyemi')
    setRegEmail(`kemi.adeyemi${randomId}@cosmopolitan.edu.ng`)
    setRegPassword('Student@2026')
    setRegMatric(`CU/2026/${randomId}`)
    setRegDept('Computer Engineering')
    setRegHostel('Hostel Block A')
    setRegRoom('203')
    setError('')
  }

  // 1-Click Persona Login
  const handleQuickLogin = (role) => {
    switchPersona(role)
    if (role === 'UNVERIFIED_STUDENT' || role === 'usr-student-unverified') {
      navigate('/verify-account')
    } else {
      navigate(getDashboardPath(role))
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* ── LEFT HERO PANEL (Mockup Matched) ───────────────────── */}
      <div className="relative lg:w-1/2 bg-primary-900 text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden min-h-[380px] lg:min-h-screen">
        {/* Background photo overlay */}
        <div
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80)',
          }}
        />
        {/* Navy gradient layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary-900/90 via-primary-900/80 to-primary-950/95" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Cosmopolitan University Logo"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-accent shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Cosmopolitan
              </h1>
              <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                University
              </p>
            </div>
          </div>
        </div>

        {/* Hero Mission Text */}
        <div className="relative z-10 my-auto py-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800 text-accent border border-primary-700/50 mb-4">
            Campus Facilities Helpdesk
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Campus Maintenance <br />
            <span className="text-accent">System</span>
          </h2>
          <p className="mt-3 text-lg font-medium text-gray-200 tracking-wide">
            Report. Track. Resolve.
          </p>
          <p className="mt-4 text-sm text-gray-300 max-w-md leading-relaxed">
            A smarter, reliable platform to report, triage, and track facility maintenance
            across all hostels, faculty buildings, and laboratories.
          </p>
        </div>

        {/* Footer brand motto */}
        <div className="relative z-10 pt-6 border-t border-primary-800/60 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} Cosmopolitan University</span>
          <span className="italic text-accent font-medium">To The Summit</span>
        </div>
      </div>

      {/* ── RIGHT CARD PANEL (LOGIN & SIGN UP TABS) ─────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          {/* Active Session Notification (if already logged in) */}
          {session && profile && (
            <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    profile?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={profile?.fullName}
                  className="h-10 w-10 rounded-full object-cover border border-primary-300"
                />
                <div>
                  <p className="text-xs font-bold text-primary-950">
                    Currently Signed In:
                  </p>
                  <p className="text-xs text-primary-800 font-semibold truncate">
                    {profile?.fullName} ({profile?.role})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath(profile?.role)}
                  className="btn-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1 shadow-sm"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab Switcher: Sign In vs Create Account */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6 border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN')
                setError('')
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-primary-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER')
                setError('')
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'REGISTER'
                  ? 'bg-white text-primary-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📝 Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {activeTab === 'LOGIN' ? 'Welcome Back!' : 'Student Registration'}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {activeTab === 'LOGIN'
                  ? 'Log in with your university credentials'
                  : 'Join the Cosmopolitan maintenance portal'}
              </p>
            </div>
            {activeTab === 'REGISTER' && (
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent bg-amber-50 hover:bg-amber-100 text-accent-dark text-xs font-bold transition-all shadow-sm"
                title="Auto-fill form with a demo student profile"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>⚡ Auto-Fill Demo</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* ── TAB 1: SIGN IN FORM ─────────────────────────────── */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@cosmopolitan.edu.ng"
                    className="input pl-10 text-xs py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10 text-xs py-2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-primary-700 focus:ring-primary-500 mr-2"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      'For password reset assistance, contact ICT Support: helpdesk@cosmopolitan.edu.ng'
                    )
                  }
                  className="text-primary-700 hover:text-primary-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              {/* Instant Demo Switcher */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-2.5">
                  Instant Demo Access (Click to Test Role):
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('STUDENT')}
                    className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 font-medium hover:bg-blue-100 transition-colors"
                  >
                    <span>👩‍🎓 Student (Chinwe)</span>
                    <ArrowRight className="h-3 w-3 text-blue-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('SUPERVISOR')}
                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <span>👨‍💼 Supervisor (Bello)</span>
                    <ArrowRight className="h-3 w-3 text-emerald-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('WORKER')}
                    className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-100 text-purple-900 font-medium hover:bg-purple-100 transition-colors"
                  >
                    <span>🔧 Worker (Engr Musa)</span>
                    <ArrowRight className="h-3 w-3 text-purple-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 font-medium hover:bg-amber-100 transition-colors"
                  >
                    <span>👑 Admin (Dr Ibrahim)</span>
                    <ArrowRight className="h-3 w-3 text-amber-500" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('UNVERIFIED_STUDENT')}
                  className="w-full mt-2 flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-dashed border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  <span>⚠️ Unverified Student (Test Verification Lock)</span>
                  <ArrowRight className="h-3 w-3 text-amber-600" />
                </button>
              </div>
            </form>
          )}

          {/* ── TAB 2: SIGN UP FORM ─────────────────────────────── */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Chinwe Eze"
                    className="input pl-10 text-xs py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    University Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="student@cosmopolitan.edu.ng"
                      className="input pl-10 text-xs py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Matric Number
                  </label>
                  <input
                    type="text"
                    value={regMatric}
                    onChange={(e) => setRegMatric(e.target.value)}
                    placeholder="CU/2026/0481"
                    className="input text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Faculty / Academic Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    placeholder="e.g. Computer Science, Law, Nursing"
                    className="input pl-10 text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Hostel Block *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Building className="h-4 w-4" />
                    </div>
                    <select
                      value={regHostel}
                      onChange={(e) => setRegHostel(e.target.value)}
                      className="input pl-10 text-xs py-2 bg-white"
                    >
                      {hostelBlocks.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Room Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <DoorClosed className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={regRoom}
                      onChange={(e) => setRegRoom(e.target.value)}
                      placeholder="e.g. 102"
                      className="input pl-10 text-xs py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="input pl-10 text-xs py-2"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? 'Creating Account...' : 'Register & Join Maintenance Portal'}
              </button>
            </form>
          )}

          {/* Secure & Trusted badge at bottom */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-gray-500">
              Cosmopolitan University Secure Portal
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
