// apps/client/src/pages/auth/LoginPage.jsx
// Split-screen login page strictly conforming to the UI mockup

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, UserPlus, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import logo from '../../assets/logo.jpg'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, switchPersona } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
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
      const role = result.user?.role || 'STUDENT'
      if (role === 'SUPERVISOR') navigate('/supervisor')
      else if (role === 'WORKER') navigate('/worker')
      else if (role === 'ADMIN') navigate('/admin')
      else navigate('/student')
    } else {
      setError(result.error || 'Failed to sign in. Please verify credentials.')
    }
  }

  const handleQuickLogin = (role) => {
    switchPersona(role)
    if (role === 'UNVERIFIED_STUDENT' || role === 'usr-student-unverified') {
      navigate('/verify-account')
    } else if (role === 'SUPERVISOR') navigate('/supervisor')
    else if (role === 'WORKER') navigate('/worker')
    else if (role === 'ADMIN') navigate('/admin')
    else navigate('/student')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* ── LEFT HERO PANEL (Mockup matched) ───────────────────── */}
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

        {/* Content over background */}
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

        <div className="relative z-10 my-auto py-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800 text-accent border border-primary-700/50 mb-4">
            Official Campus Portal
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Campus Maintenance <br />
            <span className="text-accent">System</span>
          </h2>
          <p className="mt-3 text-lg font-medium text-gray-200 tracking-wide">
            Report. Track. Resolve.
          </p>
          <p className="mt-4 text-sm text-gray-300 max-w-md leading-relaxed">
            A smarter, reliable way to report and track maintenance issues across all
            hostels, laboratories, and faculty buildings.
          </p>
        </div>

        {/* Footer brand motto */}
        <div className="relative z-10 pt-6 border-t border-primary-800/60 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} Cosmopolitan University</span>
          <span>To The Summit</span>
        </div>
      </div>

      {/* ── RIGHT LOGIN CARD PANEL (Mockup matched) ─────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome Back!
            </h3>
            <p className="mt-1 text-sm text-gray-500">Log in to continue</p>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  className="text-xs text-primary-700 hover:underline font-medium"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-semibold tracking-wide"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">or</span>
            </div>
          </div>

          {/* Create an Account button matching mockup */}
          <Link
            to="/register"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <UserPlus className="h-4 w-4 text-gray-500" />
            <span>Create an Account</span>
          </Link>

          {/* Quick Demo Personas (1-click test of all 4 roles) */}
          <div className="mt-6 pt-5 border-t border-gray-100">
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

            {/* Unverified student test trigger */}
            <button
              type="button"
              onClick={() => handleQuickLogin('UNVERIFIED_STUDENT')}
              className="w-full mt-2 flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-dashed border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>⚠️ Unverified Student (Test Verification Lock)</span>
              </span>
              <ArrowRight className="h-3 w-3 text-amber-600" />
            </button>
          </div>

          {/* Secure & Trusted badge at bottom matching mockup */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-gray-500">Secure & Trusted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
