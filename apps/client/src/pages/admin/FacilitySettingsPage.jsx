// apps/client/src/pages/admin/FacilitySettingsPage.jsx
// Facility and Issue Category configurations for Cosmopolitan University

import React from 'react'
import { Building2, Layers, CheckCircle2 } from 'lucide-react'
import { useReports } from '../../context/ReportContext.jsx'

export default function FacilitySettingsPage() {
  const { hostelBlocks, categories } = useReports()

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Facility & Category Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure physical hostel buildings, rooms, and maintenance categorization
          rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Hostel Blocks Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-primary-700 font-bold">
              <Building2 className="h-5 w-5" />
              <span>Hostel Residence Blocks</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {hostelBlocks.length} Blocks Active
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {hostelBlocks.map((block) => (
              <div key={block.id} className="py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{block.name}</h3>
                  <p className="text-xs text-gray-500">{block.description}</p>
                </div>
                <span className="font-mono text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded border">
                  {block.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Categories Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-primary-700 font-bold">
              <Layers className="h-5 w-5" />
              <span>Maintenance Categories</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {categories.length} Categories
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-500">
                    Service requests mapped to assigned technicians
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
