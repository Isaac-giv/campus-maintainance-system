// apps/client/src/context/AuthContext.jsx
// Manages authentication state using Supabase Auth with fallback instant persona switcher

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase.js'
import { MOCK_USERS } from '../data/mockData.js'

const AuthContext = createContext(null)

const AUTH_USER_KEY = 'cu_current_user'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from Supabase or cached persona
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        // Check real Supabase Auth session first
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()
        if (initialSession && isMounted) {
          setSession(initialSession)
          setUser(initialSession.user)
          // Derive default student profile for live auth user
          setProfile({
            id: initialSession.user.id,
            email: initialSession.user.email,
            fullName: initialSession.user.user_metadata?.full_name || 'Chinwe Eze',
            role: initialSession.user.user_metadata?.role || 'STUDENT',
            hostelBlock: 'Hostel Block A',
            hostelBlockId: 'blk-a',
            roomNumber: '102',
            isVerified: true,
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          })
          setLoading(false)
          return
        }
      } catch {
        // Supabase placeholder or offline
      }

      // Check saved mock persona
      try {
        const saved = localStorage.getItem(AUTH_USER_KEY)
        if (saved && isMounted) {
          const parsed = JSON.parse(saved)
          setSession({ access_token: 'mock-jwt-token' })
          setUser(parsed)
          setProfile(parsed)
          setLoading(false)
          return
        }
      } catch {
        // ignore
      }

      // Default to Chinwe Eze (Student from Mockup) for initial preview
      if (isMounted) {
        const defaultUser = MOCK_USERS[0]
        setSession({ access_token: 'mock-jwt-token' })
        setUser(defaultUser)
        setProfile(defaultUser)
        setLoading(false)
      }
    }

    initAuth()

    // Listen to real Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (!currentSession) {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  // Switch demo persona (Instant 1-click test of all 4 roles + unverified state)
  const switchPersona = (identifier) => {
    let target
    if (identifier === 'UNVERIFIED_STUDENT' || identifier === 'usr-student-unverified') {
      target = MOCK_USERS.find((u) => u.id === 'usr-student-unverified') || {
        id: 'usr-student-unverified',
        email: 'tunde.adeleke@cosmopolitan.edu.ng',
        fullName: 'Tunde Adeleke (Unverified)',
        role: 'STUDENT',
        hostelBlock: 'Hostel Block C',
        hostelBlockId: 'blk-c',
        roomNumber: '204',
        matricNumber: 'CU/2026/0891',
        isVerified: false,
        avatar:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      }
    } else {
      target =
        MOCK_USERS.find((u) => u.role === identifier || u.id === identifier) ||
        MOCK_USERS[0]
    }

    setSession({ access_token: 'mock-jwt-token' })
    setUser(target)
    setProfile(target)
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(target))
    } catch {
      // ignore
    }
  }

  // Account verification handler
  const verifyAccount = async (code = '123456') => {
    const trimmed = String(code).trim()
    // Accept standard code 123456 or empty/bypass for instant admin verification
    if (trimmed !== '' && trimmed !== '123456' && trimmed !== '000000') {
      return {
        success: false,
        error:
          'Invalid 6-digit verification code. Please enter 123456 or click Instant Verification.',
      }
    }

    const updated = {
      ...(profile || {}),
      isVerified: true,
    }
    setProfile(updated)
    setUser(updated)
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    return { success: true, profile: updated }
  }

  // Admin/manual toggle of verification status
  const setVerificationStatus = (isVerified) => {
    const updated = {
      ...(profile || {}),
      isVerified: Boolean(isVerified),
    }
    setProfile(updated)
    setUser(updated)
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  // Login handler
  const login = async (email, password) => {
    // Attempt Supabase login if configured
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data?.session) {
        setSession(data.session)
        setUser(data.user)
        return { success: true }
      }
    } catch {
      // fallback
    }

    // Match against mock personas
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (found) {
      setSession({ access_token: 'mock-jwt-token' })
      setUser(found)
      setProfile(found)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(found))
      return { success: true, user: found }
    }

    // Generic student login fallback (unverified by default for new email logins)
    const customUser = {
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: 'STUDENT',
      hostelBlock: 'Hostel Block A',
      hostelBlockId: 'blk-a',
      roomNumber: '101',
      isVerified: false,
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    }
    setSession({ access_token: 'mock-jwt-token' })
    setUser(customUser)
    setProfile(customUser)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(customUser))
    return { success: true, user: customUser }
  }

  // Register handler (New student registrations start UNVERIFIED)
  const register = async ({
    fullName,
    email,
    password,
    hostelBlock,
    roomNumber,
    matricNumber,
  }) => {
    try {
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'STUDENT' },
        },
      })
    } catch {
      // fallback
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      fullName,
      role: 'STUDENT',
      hostelBlock: hostelBlock || 'Hostel Block A',
      hostelBlockId: 'blk-a',
      roomNumber: roomNumber || '101',
      matricNumber: matricNumber || 'CU/2026/001',
      isVerified: false, // Must be verified before accessing student dashboard
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    }
    // Add to in-memory user roster
    MOCK_USERS.unshift(newUser)

    setSession({ access_token: 'mock-jwt-token' })
    setUser(newUser)
    setProfile(newUser)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  // Admin/direct user creation
  const addStudentUser = (studentData) => {
    const newStudent = {
      id: `usr-${Date.now()}`,
      email: studentData.email,
      fullName: studentData.fullName,
      role: 'STUDENT',
      hostelBlock: studentData.hostelBlock || 'Hostel Block A',
      hostelBlockId: studentData.hostelBlockId || 'blk-a',
      roomNumber: studentData.roomNumber || '101',
      matricNumber: studentData.matricNumber || 'CU/2026/999',
      department: studentData.department || 'Undergraduate Studies',
      isVerified: studentData.isVerified ?? true,
      avatar:
        studentData.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    }
    MOCK_USERS.unshift(newStudent)
    return newStudent
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    localStorage.removeItem(AUTH_USER_KEY)
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const value = {
    session,
    user,
    profile,
    setProfile,
    loading,
    login,
    register,
    addStudentUser,
    signOut,
    switchPersona,
    verifyAccount,
    setVerificationStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
