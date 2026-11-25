import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { isSupabaseConfigured } from '../../config/supabase.js'
import logo from '../../assets/logo.jpg'

export default function AuthShell({ title, subtitle, children, footer, wide }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="relative hidden w-5/12 flex-col justify-between bg-primary-900 p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Cosmopolitan University"
            className="h-12 w-12 rounded-full border-2 border-accent object-cover"
          />
          <div>
            <p className="text-lg font-black">Cosmopolitan University</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Campus Maintenance Portal
            </p>
          </div>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Report it. Track it. Get it fixed.
          </h2>
          <p className="mt-4 max-w-md text-primary-200">
            Submit maintenance complaints for hostels, lecture halls and campus
            facilities, and follow every step from review to resolution.
          </p>
        </div>
        <p className="text-xs text-primary-300">
          © {new Date().getFullYear()} Cosmopolitan University Works & Services
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img
              src={logo}
              alt=""
              className="h-10 w-10 rounded-full border border-accent object-cover"
            />
            <p className="font-black text-primary-900">Cosmopolitan Maintenance</p>
          </div>
          {!isSupabaseConfigured && (
            <div className="mb-4 flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
              in apps/client/.env.local.
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function FormError({ message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
    >
      {message}
    </div>
  )
}
