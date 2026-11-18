// apps/client/src/pages/auth/VerifyAccountPage.jsx
// Mandatory user identity & hostel residency verification screen
// Users must complete verification before gaining access to their role dashboard.

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ShieldCheck,
  Building,
  Mail,
  User,
  ArrowRight,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import logo from '../../assets/logo.jpg'

export default function VerifyAccountPage() {
  const { profile, verifyAccount, signOut, switchPersona } = useAuth()
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const navigate = useNavigate()

  // Target dashboard route based on role
  const getDashboardPath = (role) => {
    if (role === 'SUPERVISOR') return '/supervisor'
    if (role === 'WORKER') return '/worker'
    if (role === 'ADMIN') return '/admin'
    return '/student'
  }

  // If already verified, show quick redirect option
  const isAlreadyVerified = profile?.isVerified === true

  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setIsSubmitting(true)

    const res = await verifyAccount(code || '123456')
    setIsSubmitting(false)

    if (res.success) {
      setSuccessMsg('Account successfully verified! Redirecting to your dashboard...')
      setTimeout(() => {
        navigate(getDashboardPath(profile?.role))
      }, 1200)
    } else {
      setErrorMsg(res.error || 'Invalid verification code')
    }
  }

  const handleInstantApproval = async () => {
    setIsSubmitting(true)
    setErrorMsg('')
    const res = await verifyAccount('123456')
    setIsSubmitting(false)
    if (res.success) {
      setSuccessMsg('Identity verified via Campus Administration! Access granted.')
      setTimeout(() => {
        navigate(getDashboardPath(profile?.role))
      }, 1000)
    }
  }

  const handleResendCode = () => {
    setResendCountdown(30)
    setErrorMsg('')
    setSuccessMsg('A new 6-digit verification code has been dispatched to your email!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* University Crest & Title */}
        <div className="text-center">
          <img
            src={logo}
            alt="Cosmopolitan University Emblem"
            className="mx-auto h-20 w-20 rounded-full shadow-md border-2 border-accent object-cover"
          />
          <h2 className="mt-4 text-2xl font-black text-primary-900 tracking-tight">
            Cosmopolitan University
          </h2>
          <p className="text-xs uppercase tracking-wider text-accent font-bold mt-0.5">
            Identity & Residency Verification
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10 space-y-6">
          {/* Status Banner */}
          {isAlreadyVerified ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Account Already Verified!</h4>
                <p className="mt-1 text-xs text-emerald-700">
                  Your university identity is fully verified. You have full authorized
                  access to your dashboard.
                </p>
                <button
                  onClick={() => navigate(getDashboardPath(profile?.role))}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-amber-950 text-sm">
                  Verification Required to Access Dashboard
                </h4>
                <p className="text-amber-800 leading-relaxed">
                  Under Cosmopolitan University campus maintenance security protocols, all
                  student and staff accounts must be verified before viewing facility
                  dashboards or filing work orders.
                </p>
              </div>
            </div>
          )}

          {/* User Profile Card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  profile?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={profile?.fullName}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {profile?.fullName || 'Student User'}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">
                    {profile?.role || 'STUDENT'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">
                    {profile?.email || 'user@cosmopolitan.edu.ng'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Building className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate font-medium">
                  {profile?.hostelBlock || 'Hostel Block A'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate font-mono">
                  {profile?.matricNumber || 'Room ' + (profile?.roomNumber || '102')}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-pulse">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Interactive Code Form (if not verified) */}
          {!isAlreadyVerified && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Enter 6-Digit Verification PIN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="input text-center text-xl font-mono tracking-widest font-bold py-2.5"
                    autoFocus
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Demo code: &ldquo;123456&rdquo;</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCountdown > 0}
                    className="text-primary-700 font-semibold hover:underline disabled:text-gray-400"
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend PIN'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                <span>Verify & Access Dashboard</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-white px-2">
                  Demo Fast-Track
                </div>
              </div>

              {/* Instant 1-Click Verification Bypass */}
              <button
                type="button"
                onClick={handleInstantApproval}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-accent bg-amber-50/50 hover:bg-amber-100/60 text-accent-dark text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Simulate Instant Admin Approval</span>
              </button>
            </form>
          )}

          {/* Quick Demo Switcher & Sign Out */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={() => {
                switchPersona('STUDENT')
                navigate('/student')
              }}
              className="text-primary-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Switch to Verified Chinwe</span>
            </button>
            <button
              onClick={handleSignOut}
              className="text-red-600 font-medium hover:underline flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
