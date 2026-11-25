import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2, MailOpen, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
  cx,
  formatDate,
  timeAgo,
} from '../../components/ui/index.jsx'

export default function NotificationsPage() {
  const { profile } = useAuth()
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } =
    useNotifications()
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()

  const list =
    filter === 'UNREAD' ? notifications.filter((n) => !n.is_read) : notifications

  const open = (n) => {
    if (!n.is_read) markRead(n.id)
    if (!n.report_id) return
    const r = profile.role
    navigate(
      r === 'STUDENT'
        ? `/student/reports/${n.report_id}`
        : r === 'TECHNICIAN'
          ? `/technician/jobs/${n.report_id}`
          : `/supervisor/complaints/${n.report_id}`
    )
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllRead}>
              <Check className="mr-1 h-4 w-4" /> Mark all as read
            </Button>
          )
        }
      />
      <div className="mb-4 inline-flex rounded-lg border bg-white p-1 text-sm">
        {['ALL', 'UNREAD'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              'rounded-md px-3 py-1.5 font-medium',
              filter === f
                ? 'bg-primary-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {f === 'ALL' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>
      {loading && !notifications.length ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="Updates about your complaints and jobs will appear here."
        />
      ) : (
        <Card className="divide-y p-0">
          {list.map((n) => (
            <div
              key={n.id}
              className={cx(
                'flex items-start gap-3 p-4',
                !n.is_read && 'bg-primary-50/50'
              )}
            >
              <span
                className={cx(
                  'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                  n.is_read ? 'bg-gray-300' : 'bg-primary-600'
                )}
                aria-label={n.is_read ? 'read' : 'unread'}
              />
              <button onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cx(
                      'text-sm',
                      n.is_read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'
                    )}
                  >
                    {n.title}
                  </span>
                  {n.report?.reference_number && (
                    <span className="font-mono text-[11px] text-primary-700">
                      {n.report.reference_number}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                <p
                  className="mt-1 text-xs text-gray-400"
                  title={formatDate(n.created_at)}
                >
                  {timeAgo(n.created_at)}
                </p>
              </button>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => markRead(n.id, !n.is_read)}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                  title={n.is_read ? 'Mark as unread' : 'Mark as read'}
                >
                  {n.is_read ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <MailOpen className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => remove(n.id)}
                  className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
