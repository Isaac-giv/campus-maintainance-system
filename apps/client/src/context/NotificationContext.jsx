// Notification state with Supabase Realtime updates.

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase.js'
import { useAuth } from './AuthContext.jsx'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '../services/api.js'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { profile } = useAuth()
  const userId = profile?.id
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) return setItems([])
    setLoading(true)
    try {
      setItems(await fetchNotifications(userId, { limit: 100 }))
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
    if (!userId) return
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => refresh()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, refresh])

  const markRead = async (id, read = true) => {
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, is_read: read } : n)))
    await markNotificationRead(id, read).catch(refresh)
  }
  const markAllRead = async () => {
    setItems((xs) => xs.map((n) => ({ ...n, is_read: true })))
    await markAllNotificationsRead().catch(refresh)
  }
  const remove = async (id) => {
    setItems((xs) => xs.filter((n) => n.id !== id))
    await deleteNotification(id).catch(refresh)
  }

  const value = {
    notifications: items,
    unreadCount: items.filter((n) => !n.is_read).length,
    loading,
    refresh,
    markRead,
    markAllRead,
    remove,
  }
  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
