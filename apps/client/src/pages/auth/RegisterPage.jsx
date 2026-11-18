// apps/client/src/pages/auth/RegisterPage.jsx
// Student registration page with hostel and room allocation fields

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Building,
  DoorClosed,
  ShieldCheck,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReports } from '../../context/ReportContext.jsx'
import logo from '../../assets/logo.jpg'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [hostelBlock, setHostelBlock] = useState('Hostel Block A')
  const [roomNumber, setRoomNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const { hostelBlocks } = useReports()
  const navigate = useNavigate()

  const handleDemoFill = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000)
    setFullName('Kemi Adeyemi')
    setEmail(`kemi.adeyemi${randomId}@cosmopolitan.edu.ng`)
    setPassword('Student@2026')
    setMatricNumber(`CU/2026/${randomId}`)
    setDepartment('Computer Engineering')
    setHostelBlock('Hostel Block A')
    setRoomNumber('203')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName || !email || !password || !roomNumber) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)
    const result = await register({
      fullName,
      email,
      password,
      matricNumber,
      department,
      hostelBlock,
      roomNumber,
    })
    setLoading(false)
    if (result.success) {
      navigate('/verify-account')
    } else {
      setError(result.error || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* ── LEFT HERO PANEL ───────────────────────────────────── */}
      <div className="relative lg:w-1/2 bg-primary-900 text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden min-h-[340px] lg:min-h-screen">
        <div
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary-900/90 via-primary-900/80 to-primary-950/95" />

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

        <div className="relative z-10 my-auto py-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800 text-accent border border-primary-700/50 mb-4">
            Student Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Join the Campus Maintenance Portal
          </h2>
          <p className="mt-3 text-sm text-gray-300 max-w-md leading-relaxed">
            Report facility issues within seconds. Get real-time updates as maintenance
            supervisors assign technicians and verify repairs.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-primary-800/60 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} Cosmopolitan University</span>
          <span>To The Summit</span>
        </div>
      </div>

      {/* ── RIGHT REGISTER CARD PANEL ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Create an Account
              </h3>
              <p className="mt-1 text-sm text-gray-500">Student Residence Registration</p>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent bg-amber-50 hover:bg-amber-100 text-accent-dark text-xs font-bold transition-all shadow-sm"
              title="Auto-fill form with a demo student profile"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>⚡ Auto-Fill Demo</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chinwe Eze"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Institutional Email *
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Matric Number (Optional)
                </label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="CU/2026/0481"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Faculty / Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science, Law, Mechanical Engineering"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Hostel Location Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Hostel Block *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <select
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    className="input pl-10 bg-white"
                  >
                    {hostelBlocks.map((block) => (
                      <option key={block.id} value={block.name}>
                        {block.name}
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
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 102"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-semibold tracking-wide mt-2"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:underline">
              Sign In
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-gray-500">
              Official Cosmopolitan University Identity
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
