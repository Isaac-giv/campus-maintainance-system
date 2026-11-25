import React, { useState } from 'react'
import { Users } from 'lucide-react'
import { ROLE_LABELS } from '@campus/shared'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  fetchDepartments,
  fetchSpecializations,
  fetchUsers,
  adminAssignDepartment,
} from '../../services/api.js'
import {
  Button,
  ErrorState,
  Modal,
  PageHeader,
  Select,
  Spinner,
} from '../../components/ui/index.jsx'
import CrudSection from './CrudSection.jsx'

function AssignStaffModal({ departments, staff, onClose, onDone }) {
  const toast = useToast()
  const [dept, setDept] = useState('')
  const [selected, setSelected] = useState([])
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      await adminAssignDepartment(selected, dept || null)
      toast.success('Staff assigned.')
      onDone()
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title="Assign staff to department"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!selected.length} loading={busy} onClick={save}>
            Assign {selected.length || ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          value={dept}
          onChange={setDept}
          placeholder="No department (campus-wide)"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
        />
        <div className="max-h-80 divide-y overflow-y-auto rounded-lg border">
          {staff.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-3 p-2.5 text-sm hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, s.id]
                      : selected.filter((x) => x !== s.id)
                  )
                }
              />
              <span className="flex-1 font-medium">{s.full_name}</span>
              <span className="text-xs text-gray-500">
                {ROLE_LABELS[s.role]} · {s.department?.name || 'No department'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default function DepartmentsPage() {
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([fetchDepartments(true), fetchSpecializations(true), fetchUsers()]),
    []
  )
  const [assignOpen, setAssignOpen] = useState(false)
  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const [departments, specializations, users] = data
  const staff = users.filter((u) => u.role !== 'STUDENT')
  const deptOptions = departments
    .filter((d) => d.is_active)
    .map((d) => ({ value: d.id, label: d.name }))
  const countStaff = (id) => staff.filter((s) => s.department_id === id).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments & specializations"
        subtitle="Organise maintenance staff and technician skills."
        actions={
          <Button variant="secondary" onClick={() => setAssignOpen(true)}>
            <Users className="mr-1 h-4 w-4" /> Assign staff
          </Button>
        }
      />
      <CrudSection
        title="Departments"
        description="Supervisors in a department are notified of complaints in that department's categories."
        table="departments"
        rows={departments}
        onChanged={reload}
        fields={[
          { key: 'name', label: 'Name', required: true },
          { key: 'code', label: 'Code', placeholder: 'e.g. WKS' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ]}
        columns={[
          {
            key: 'name',
            label: 'Department',
            render: (d) => (
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-gray-500">{d.description}</p>
              </div>
            ),
          },
          { key: 'code', label: 'Code' },
          { key: 'staff', label: 'Staff', render: (d) => countStaff(d.id) },
        ]}
      />
      <CrudSection
        title="Technician specializations"
        description="Assign specializations to technicians from the Users page to help supervisors pick the right person."
        table="specializations"
        rows={specializations}
        onChanged={reload}
        fields={[
          { key: 'name', label: 'Name', required: true },
          {
            key: 'department_id',
            label: 'Department',
            type: 'select',
            options: deptOptions,
          },
          { key: 'description', label: 'Description', type: 'textarea' },
        ]}
        columns={[
          {
            key: 'name',
            label: 'Specialization',
            render: (s) => <span className="font-medium">{s.name}</span>,
          },
          { key: 'dept', label: 'Department', render: (s) => s.department?.name || '—' },
          {
            key: 'techs',
            label: 'Technicians',
            render: (s) =>
              users.filter((u) =>
                u.specializations?.some((x) => x.specialization_id === s.id)
              ).length,
          },
        ]}
      />
      {assignOpen && (
        <AssignStaffModal
          departments={departments.filter((d) => d.is_active)}
          staff={staff}
          onClose={() => setAssignOpen(false)}
          onDone={reload}
        />
      )}
    </div>
  )
}
