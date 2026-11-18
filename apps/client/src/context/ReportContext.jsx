// apps/client/src/context/ReportContext.jsx
// Central state management for Maintenance Reports and Notifications

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  INITIAL_REPORTS,
  MOCK_HOSTEL_BLOCKS,
  MOCK_CATEGORIES,
  MOCK_WORKERS,
} from '../data/mockData.js'

const ReportContext = createContext(null)

const STORAGE_KEY = 'cu_maintenance_reports'

export function ReportProvider({ children }) {
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return INITIAL_REPORTS
  })

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Report In Progress',
      message:
        'Engr. Musa Sani has started work on your report: Faulty Light (CU-2026-000042)',
      time: '10m ago',
      isRead: false,
      reportId: 'rep-001',
    },
    {
      id: 'notif-2',
      title: 'Report Verified & Resolved',
      message:
        'Your plumbing report: Leaking Pipe (CU-2026-000038) has been resolved by Supervisor Bello.',
      time: '2h ago',
      isRead: false,
      reportId: 'rep-002',
    },
  ])

  // Sync reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    } catch {
      // ignore
    }
  }, [reports])

  // Create a new report (Student)
  const addReport = (newReportData, user) => {
    const year = new Date().getFullYear()
    const nextSeq = String(reports.length + 45).padStart(6, '0')
    const trackingCode = `CU-${year}-${nextSeq}`
    const id = `rep-${Date.now()}`

    const newReport = {
      id,
      trackingCode,
      title: newReportData.title,
      description: newReportData.description,
      category: newReportData.category || 'General Maintenance',
      categoryId: newReportData.categoryId || 'cat-general',
      hostelBlock: user.hostelBlock || 'Hostel Block A',
      hostelBlockId: user.hostelBlockId || 'blk-a',
      roomNumber: user.roomNumber || '101',
      specificLocationDetails: newReportData.specificLocationDetails || '',
      status: 'PENDING',
      priority: 'LOW',
      studentId: user.id,
      studentName: user.fullName || 'Student',
      currentWorkerId: null,
      workerName: null,
      createdAt: new Date().toISOString(),
      photoUrl:
        newReportData.photoUrl ||
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          notes: 'Report submitted by student',
        },
      ],
    }

    setReports((prev) => [newReport, ...prev])

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Report Submitted',
        message: `Your report ${newReport.title} (${trackingCode}) has been queued for supervisor triage.`,
        time: 'Just now',
        isRead: false,
        reportId: id,
      },
      ...prev,
    ])

    return newReport
  }

  // Assign worker to report (Supervisor / Admin)
  const assignWorker = (reportId, workerId, priority, instructions, _supervisorName) => {
    const worker = MOCK_WORKERS.find((w) => w.id === workerId)
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep
        const newHistory = [
          ...rep.statusHistory,
          {
            status: 'ASSIGNED',
            timestamp: new Date().toISOString(),
            notes: `Assigned to ${worker?.name || 'Worker'} with ${priority} priority. ${instructions ? `Notes: ${instructions}` : ''}`,
          },
        ]
        return {
          ...rep,
          status: 'ASSIGNED',
          priority: priority || rep.priority,
          currentWorkerId: workerId,
          workerName: worker?.name || 'Assigned Worker',
          statusHistory: newHistory,
        }
      })
    )
  }

  // Start work (Worker)
  const startWork = (reportId) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep
        return {
          ...rep,
          status: 'IN_PROGRESS',
          statusHistory: [
            ...rep.statusHistory,
            {
              status: 'IN_PROGRESS',
              timestamp: new Date().toISOString(),
              notes: 'Worker has arrived and commenced maintenance work.',
            },
          ],
        }
      })
    )
  }

  // Complete work (Worker -> Awaiting Verification)
  const completeWork = (reportId, workerNotes, resolutionPhotoUrl) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep
        return {
          ...rep,
          status: 'AWAITING_VERIFICATION',
          workerNotes,
          resolutionPhotoUrl:
            resolutionPhotoUrl ||
            'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
          statusHistory: [
            ...rep.statusHistory,
            {
              status: 'AWAITING_VERIFICATION',
              timestamp: new Date().toISOString(),
              notes:
                workerNotes ||
                'Job completed by maintenance technician. Awaiting supervisor verification.',
            },
          ],
        }
      })
    )
  }

  // Verify and Resolve (Supervisor / Admin)
  const verifyAndResolve = (reportId, supervisorNotes) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep
        return {
          ...rep,
          status: 'RESOLVED',
          supervisorNotes,
          statusHistory: [
            ...rep.statusHistory,
            {
              status: 'RESOLVED',
              timestamp: new Date().toISOString(),
              notes: supervisorNotes || 'Work inspected and signed off by supervisor.',
            },
          ],
        }
      })
    )
  }

  // Reject / Request rework (Supervisor)
  const rejectWork = (reportId, rejectionReason) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep
        return {
          ...rep,
          status: 'REJECTED',
          supervisorNotes: rejectionReason,
          statusHistory: [
            ...rep.statusHistory,
            {
              status: 'REJECTED',
              timestamp: new Date().toISOString(),
              notes: `Rework requested: ${rejectionReason}`,
            },
          ],
        }
      })
    )
  }

  // Cancel report (Student)
  const cancelReport = (reportId, reason) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep
        return {
          ...rep,
          status: 'CANCELLED',
          statusHistory: [
            ...rep.statusHistory,
            {
              status: 'CANCELLED',
              timestamp: new Date().toISOString(),
              notes: reason || 'Cancelled by student',
            },
          ],
        }
      })
    )
  }

  // Mark all notifications as read
  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <ReportContext.Provider
      value={{
        reports,
        notifications,
        unreadCount,
        markNotificationsAsRead,
        addReport,
        assignWorker,
        startWork,
        completeWork,
        verifyAndResolve,
        rejectWork,
        cancelReport,
        hostelBlocks: MOCK_HOSTEL_BLOCKS,
        categories: MOCK_CATEGORIES,
        workers: MOCK_WORKERS,
      }}
    >
      {children}
    </ReportContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider')
  }
  return context
}
