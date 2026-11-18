// apps/client/src/pages/admin/UserManagementPage.jsx
// Administrative user management, role assignments, room allocations, and verification approval.

import React, { useState } from 'react'
import {
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import { MOCK_USERS } from '../../data/mockData.js'

export default function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [verificationFilter, setVerificationFilter] = useState('ALL')
  const [editingUser, setEditingUser] = useState(null)
  const [newRole, setNewRole] = useState('STUDENT')
  const [newRoom, setNewRoom] = useState('')
  const [newVerified, setNewVerified] = useState(true)
  const [alertMsg, setAlertMsg] = useState('')

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addFullName, setAddFullName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addMatric, setAddMatric] = useState('')
  const [addDept, setAddDept] = useState('')
  const [addHostel, setAddHostel] = useState('Hostel Block A')
  const [addRoom, setAddRoom] = useState('')
  const [addVerified, setAddVerified] = useState(true)

  const handleAddStudentSubmit = (e) => {
    e.preventDefault()
    if (!addFullName || !addEmail || !addRoom) return

    const created = {
      id: `usr-student-${Date.now()}`,
      fullName: addFullName,
      email: addEmail,
      matricNumber: addMatric || `CU/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      department: addDept || 'General Studies',
      role: 'STUDENT',
      hostelBlock: addHostel,
      hostelBlockId: addHostel.toLowerCase().includes('block a')
        ? 'blk-a'
        : addHostel.toLowerCase().includes('block b')
          ? 'blk-b'
          : addHostel.toLowerCase().includes('block c')
            ? 'blk-c'
            : 'blk-d',
      roomNumber: addRoom,
      isVerified: addVerified,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    }

    setUsers([created, ...users])
    MOCK_USERS.unshift(created)

    setAlertMsg(
      `Successfully registered new student ${created.fullName} (${created.hostelBlock}, Room ${created.roomNumber})!`
    )
    setShowAddModal(false)
    setAddFullName('')
    setAddEmail('')
    setAddMatric('')
    setAddDept('')
    setAddRoom('')
    setTimeout(() => setAlertMsg(''), 4000)
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    const isUserVerified = u.isVerified !== false
    const matchesVerification =
      verificationFilter === 'ALL' ||
      (verificationFilter === 'VERIFIED' && isUserVerified) ||
      (verificationFilter === 'UNVERIFIED' && !isUserVerified)
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesVerification && matchesSearch
  })

  const handleToggleVerification = (targetUser) => {
    const nextStatus = targetUser.isVerified === false ? true : false
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, isVerified: nextStatus } : u))
    )
    setAlertMsg(
      `${targetUser.fullName} is now ${nextStatus ? 'Verified (Access Granted)' : 'Unverified (Access Restricted)'}!`
    )
    setTimeout(() => setAlertMsg(''), 4000)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingUser) return

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              role: newRole,
              roomNumber: newRoom || u.roomNumber,
              isVerified: newVerified,
            }
          : u
      )
    )

    setAlertMsg(`Updated ${editingUser.fullName}'s profile and credentials!`)
    setEditingUser(null)
    setTimeout(() => setAlertMsg(''), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            User Management & Verification
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage campus accounts, assign administrative roles, oversee hostel room
            allocations, and approve student identity verification.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Add New Student</span>
        </button>
      </div>

      {alertMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Controls */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="input pl-9 text-xs py-1.5"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input py-1.5 px-3 text-xs bg-white w-auto"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="SUPERVISOR">Supervisors</option>
            <option value="WORKER">Technicians (Workers)</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="input py-1.5 px-3 text-xs bg-white w-auto"
          >
            <option value="ALL">All Verification</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNVERIFIED">Pending Verification Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">User Profile</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Hostel Allocation</th>
                <th className="px-5 py-3">Identity / Matric</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isUserVerified = u.isVerified !== false
                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="h-9 w-9 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {u.fullName}
                          </div>
                          <div className="text-gray-500 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'SUPERVISOR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.role === 'WORKER'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.hostelBlock ? (
                        <span className="font-medium text-gray-800">
                          {u.hostelBlock} {u.roomNumber ? `• Room ${u.roomNumber}` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400">Campus Staff</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-gray-500">
                      {u.matricNumber || u.specialty || 'Administrative'}
                    </td>
                    <td className="px-5 py-4">
                      {isUserVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleVerification(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                          title="Click to instantly approve & verify this user"
                        >
                          <ShieldAlert className="h-3 w-3 text-amber-600" />
                          <span>Pending (Click to Approve)</span>
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleVerification(u)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          title={
                            isUserVerified
                              ? 'Revoke Verification'
                              : 'Approve Verification'
                          }
                        >
                          <UserCheck
                            className={`h-4 w-4 ${isUserVerified ? 'text-emerald-600' : 'text-amber-600'}`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setNewRole(u.role)
                            setNewRoom(u.roomNumber || '')
                            setNewVerified(isUserVerified)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role / Room Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Edit User: {editingUser.fullName}
            </h3>
            <p className="text-xs text-gray-500">
              Adjust portal permissions, assigned hostel accommodation, and identity
              verification status.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assigned Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="input text-xs py-2"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="WORKER">WORKER (Technician)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hostel Room Number
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="e.g. 102"
                  className="input text-xs py-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="user-verified-check"
                  checked={newVerified}
                  onChange={(e) => setNewVerified(e.target.checked)}
                  className="rounded text-primary-700 focus:ring-primary-500 h-4 w-4"
                />
                <label
                  htmlFor="user-verified-check"
                  className="text-xs font-bold text-gray-800"
                >
                  Account Identity Verified (Can access dashboard)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold px-4 py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Onboard New Student</h3>
                <p className="text-xs text-gray-500">
                  Add a student to the campus registry and assign hostel accommodation.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="e.g. Fatima Dahiru"
                  className="input text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="student@cosmopolitan.edu.ng"
                    className="input text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Matriculation Number
                  </label>
                  <input
                    type="text"
                    value={addMatric}
                    onChange={(e) => setAddMatric(e.target.value)}
                    placeholder="CU/2026/0890"
                    className="input text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Faculty / Academic Department
                </label>
                <input
                  type="text"
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  placeholder="e.g. Mechanical Engineering, Law, Nursing"
                  className="input text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Hostel Block *
                  </label>
                  <select
                    value={addHostel}
                    onChange={(e) => setAddHostel(e.target.value)}
                    className="input text-xs py-2 bg-white"
                  >
                    <option value="Hostel Block A">Hostel Block A</option>
                    <option value="Hostel Block B">Hostel Block B</option>
                    <option value="Hostel Block C">Hostel Block C</option>
                    <option value="Hostel Block D">Hostel Block D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={addRoom}
                    onChange={(e) => setAddRoom(e.target.value)}
                    placeholder="e.g. 104"
                    className="input text-xs py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add-verified-check"
                  checked={addVerified}
                  onChange={(e) => setAddVerified(e.target.checked)}
                  className="rounded text-primary-700 focus:ring-primary-500 h-4 w-4"
                />
                <label
                  htmlFor="add-verified-check"
                  className="text-xs font-bold text-gray-800"
                >
                  Verify Student Identity Immediately (Grants instant dashboard access)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold px-4 py-2">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
