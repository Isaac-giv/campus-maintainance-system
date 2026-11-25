// Authentication state backed by Supabase Auth + public.profiles.

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase.js'
import { fetchProfile } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState(false)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return null
    }
    try {
      const p = await fetchProfile(userId)
      setProfile(p)
      return p
    } catch {
      setProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return
        setSession(data.session)
        await loadProfile(data.session?.user?.id)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(newSession)
      if (event === 'SIGNED_OUT') setProfile(null)
      else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Defer to avoid deadlocks inside the auth callback.
        setTimeout(() => loadProfile(newSession?.user?.id), 0)
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      if (/banned/i.test(error.message))
        throw new Error('Your account has been deactivated. Contact the administrator.')
      if (/Email not confirmed/i.test(error.message))
        throw new Error('Please confirm your email address before signing in.')
      throw new Error(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
    }
    const p = await loadProfile(data.user.id)
    if (!p) {
      await supabase.auth.signOut()
      throw new Error('Your profile could not be loaded. Contact the administrator.')
    }
    if (!p.is_active) {
      await supabase.auth.signOut()
      throw new Error('Your account has been deactivated. Contact the administrator.')
    }
    return p
  }

  const signUp = async (form) => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: form.fullName.trim(),
          phone: form.phone?.trim() || null,
          matric_number: form.matricNumber.trim(),
          programme: form.programme?.trim() || null,
          level: form.level || null,
          building_id: form.buildingId || null,
          room_number: form.roomNumber?.trim() || null,
        },
      },
    })
    if (error) throw new Error(error.message)
    // When email confirmation is enabled, no session is returned.
    return { needsConfirmation: !data.session }
  }

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
    setRecovery(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.is_active ? profile.role : null,
    loading,
    recovery,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    refreshProfile: () => loadProfile(session?.user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
