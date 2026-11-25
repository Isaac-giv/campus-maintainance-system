// campus-maintenance-system/supabase/seed_roles.cjs
// Script to provision authentic seed users for all roles (STUDENT, SUPERVISOR, TECHNICIAN, ADMIN)
// and generate realistic maintenance complaint lifecycle data in the live Supabase project.

const { createClient } = require('../node_modules/@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qftiixqkbalemmqkvupy.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEED_USERS = [
  {
    email: 'supervisor@cosmopolitan.edu.ng',
    password: 'Supervisor@1234',
    role: 'SUPERVISOR',
    fullName: 'Mr. Bello Ahmed',
    phone: '+234 803 111 2233',
    departmentCode: 'WKS',
    jobTitle: 'Hostel Maintenance Supervisor',
  },
  {
    email: 'technician.electrical@cosmopolitan.edu.ng',
    password: 'Technician@1234',
    role: 'TECHNICIAN',
    fullName: 'Engr. Musa Sani',
    phone: '+234 802 444 5566',
    departmentCode: 'ELC',
    jobTitle: 'Senior Electrical Technician',
    specializationName: 'Electrical',
  },
  {
    email: 'technician.plumbing@cosmopolitan.edu.ng',
    password: 'Technician@1234',
    role: 'TECHNICIAN',
    fullName: 'Emeka Okafor',
    phone: '+234 805 777 8899',
    departmentCode: 'WKS',
    jobTitle: 'Lead Plumbing Specialist',
    specializationName: 'Plumbing',
  },
  {
    email: 'technician.carpentry@cosmopolitan.edu.ng',
    password: 'Technician@1234',
    role: 'TECHNICIAN',
    fullName: 'Babajide Adeleke',
    phone: '+234 807 222 3344',
    departmentCode: 'WKS',
    jobTitle: 'Master Carpenter & Joiner',
    specializationName: 'Carpentry',
  },
  {
    email: 'student@cosmopolitan.edu.ng',
    password: 'Student@1234',
    role: 'STUDENT',
    fullName: 'Chinwe Eze',
    phone: '+234 809 333 4455',
    matricNumber: 'CU/2023/1042',
    programme: 'B.Sc. Computer Science',
    level: '300',
    buildingCode: 'HBA',
    roomNumber: '102',
  },
  {
    email: 'student.hostelb@cosmopolitan.edu.ng',
    password: 'Student@1234',
    role: 'STUDENT',
    fullName: 'Amina Bello',
    phone: '+234 808 666 7788',
    matricNumber: 'CU/2024/2045',
    programme: 'B.Eng. Electrical Engineering',
    level: '200',
    buildingCode: 'HBB',
    roomNumber: '202',
  },
  {
    email: 'admin@cosmopolitan.edu.ng',
    password: 'Admin@1234',
    role: 'ADMIN',
    fullName: 'Dr. Ibrahim Aliyu',
    phone: '+234 801 999 0011',
    departmentCode: 'WKS',
    jobTitle: 'Director of Works & Physical Planning',
  },
]

async function main() {
  console.log('--- 1. Fetching master reference data ---')
  const { data: departments } = await supabase.from('departments').select('id, name, code')
  const { data: buildings } = await supabase.from('buildings').select('id, name, code')
  const { data: categories } = await supabase.from('maintenance_categories').select('id, name')
  const { data: specializations } = await supabase.from('specializations').select('id, name')

  const deptMap = Object.fromEntries((departments || []).map((d) => [d.code, d.id]))
  const bldMap = Object.fromEntries((buildings || []).map((b) => [b.code, b.id]))
  const catMap = Object.fromEntries((categories || []).map((c) => [c.name, c.id]))
  const specMap = Object.fromEntries((specializations || []).map((s) => [s.name, s.id]))

  console.log('--- 2. Creating / Provisioning Users ---')
  const createdUserMap = {}

  for (const u of SEED_USERS) {
    // Check if user already exists
    const { data: existingList } = await supabase.auth.admin.listUsers()
    let user = existingList?.users?.find((x) => x.email.toLowerCase() === u.email.toLowerCase())

    if (!user) {
      console.log(`Creating auth user: ${u.email} (${u.role})...`)
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name: u.fullName,
          phone: u.phone,
          matric_number: u.matricNumber,
          programme: u.programme,
          level: u.level,
          building_id: u.buildingCode ? bldMap[u.buildingCode] : undefined,
          room_number: u.roomNumber,
        },
        app_metadata: {
          role: u.role,
        },
      })

      if (createErr) {
        console.error(`Failed to create ${u.email}:`, createErr.message)
        continue
      }
      user = newUser.user
    } else {
      console.log(`User already exists: ${u.email}. Updating role & password...`)
      await supabase.auth.admin.updateUserById(user.id, {
        password: u.password,
        email_confirm: true,
        app_metadata: { role: u.role },
        user_metadata: {
          full_name: u.fullName,
          phone: u.phone,
        },
      })
    }

    createdUserMap[u.role + '_' + u.email] = user.id

    // Update profile
    await supabase
      .from('profiles')
      .update({
        full_name: u.fullName,
        phone: u.phone,
        role: u.role,
        department_id: u.departmentCode ? deptMap[u.departmentCode] : null,
        is_active: true,
      })
      .eq('id', user.id)

    // Role-specific records
    if (u.role === 'STUDENT') {
      await supabase.from('student_profiles').upsert({
        user_id: user.id,
        matric_number: u.matricNumber,
        programme: u.programme,
        level: u.level,
        building_id: bldMap[u.buildingCode],
        room_number: u.roomNumber,
      })
    } else {
      await supabase.from('staff_profiles').upsert({
        user_id: user.id,
        job_title: u.jobTitle,
        is_available: true,
      })

      if (u.role === 'TECHNICIAN' && u.specializationName && specMap[u.specializationName]) {
        await supabase.from('technician_specializations').upsert({
          technician_id: user.id,
          specialization_id: specMap[u.specializationName],
        })
      }
    }
  }

  console.log('--- 3. Seeding Realistic Maintenance Reports ---')
  const studentChinweId = createdUserMap['STUDENT_student@cosmopolitan.edu.ng']
  const studentAminaId = createdUserMap['STUDENT_student.hostelb@cosmopolitan.edu.ng']
  const supervisorId = createdUserMap['SUPERVISOR_supervisor@cosmopolitan.edu.ng']
  const techMusaId = createdUserMap['TECHNICIAN_technician.electrical@cosmopolitan.edu.ng']
  const techEmekaId = createdUserMap['TECHNICIAN_technician.plumbing@cosmopolitan.edu.ng']
  const techBabajideId = createdUserMap['TECHNICIAN_technician.carpentry@cosmopolitan.edu.ng']

  if (!studentChinweId || !supervisorId || !techMusaId || !techEmekaId) {
    console.log('Skipping report creation due to missing user IDs.')
    return
  }

  const reportsToSeed = [
    {
      reference_number: 'CU-2026-001001',
      title: 'Water Leakage Under Washbasin',
      description: 'The cold water flex hose under the sink is dripping continuously and pooling on the floor.',
      category_id: catMap['Plumbing'],
      building_id: bldMap['HBA'],
      location_details: 'Hostel Block A, Room 102',
      status: 'PENDING',
      priority: 'HIGH',
      student_id: studentChinweId,
    },
    {
      reference_number: 'CU-2026-001002',
      title: 'Overhead Light Flickering & Sputtering',
      description: 'Fluorescent fitting on ceiling buzzes loudly and flickers whenever turned on.',
      category_id: catMap['Electrical'],
      building_id: bldMap['HBA'],
      location_details: 'Hostel Block A, Room 101',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      student_id: studentChinweId,
      current_technician_id: techMusaId,
      reviewed_by: supervisorId,
      reviewed_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      reference_number: 'CU-2026-001003',
      title: 'Damaged Door Lock & Loose Handle',
      description: 'Mortise latch handle is jammed from the outside. Key turns but deadbolt does not retract smoothly.',
      category_id: catMap['Furniture & Fittings'],
      building_id: bldMap['HBB'],
      location_details: 'Hostel Block B, Room 202',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      student_id: studentAminaId,
      current_technician_id: techBabajideId,
      reviewed_by: supervisorId,
      reviewed_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      reference_number: 'CU-2026-001004',
      title: 'Low Water Pressure in Shared Bathroom',
      description: 'Showers and taps in the ground floor bathroom have very low flow, barely running.',
      category_id: catMap['Plumbing'],
      building_id: bldMap['HBA'],
      location_details: 'Hostel Block A, Shared Bathroom - Ground',
      status: 'AWAITING_VERIFICATION',
      priority: 'MEDIUM',
      student_id: studentChinweId,
      current_technician_id: techEmekaId,
      reviewed_by: supervisorId,
      reviewed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      started_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      completion_notes: 'Replaced worn 3/4" gate valve on main riser and cleared mineral deposits from shower head. Pressure restored to 3.2 bar.',
    },
    {
      reference_number: 'CU-2026-001005',
      title: 'Tripped Circuit Breaker in Study Area',
      description: 'Power sockets on the west wall went dead when heavy equipment was plugged in.',
      category_id: catMap['Electrical'],
      building_id: bldMap['FOS'],
      location_details: 'Faculty of Science, Lecture Theatre 1',
      status: 'RESOLVED',
      priority: 'URGENT',
      student_id: studentChinweId,
      current_technician_id: techMusaId,
      reviewed_by: supervisorId,
      reviewed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      started_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      completion_notes: 'Identified short-circuited extension board. Isolated socket and reset distribution board breaker 4.',
      verified_by: supervisorId,
      resolved_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    },
    {
      reference_number: 'CU-2026-001006',
      title: 'Ceiling Fan Making Persistent Squeaking Noise',
      description: 'Fan wobbles and makes high pitched screeching sound that prevents sleeping.',
      category_id: catMap['Air Conditioning'],
      building_id: bldMap['HBB'],
      location_details: 'Hostel Block B, Room 202',
      status: 'REJECTED',
      priority: 'LOW',
      student_id: studentAminaId,
      current_technician_id: techMusaId,
      reviewed_by: supervisorId,
      reviewed_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      completion_notes: 'Tightened exterior blade screws.',
      rejection_reason: 'Noise persists at speed level 3. Technician needs to replace rubber grommet and lubricate bearings.',
    },
  ]

  for (const rep of reportsToSeed) {
    const { data: existingRep } = await supabase
      .from('maintenance_reports')
      .select('id')
      .eq('reference_number', rep.reference_number)
      .maybeSingle()

    if (!existingRep) {
      console.log(`Inserting report: ${rep.reference_number} - ${rep.title} (${rep.status})...`)
      const { data: inserted, error: repErr } = await supabase
        .from('maintenance_reports')
        .insert(rep)
        .select()
        .single()

      if (repErr) {
        console.error(`Failed to insert report ${rep.reference_number}:`, repErr.message)
      } else if (inserted) {
        // Add audit history
        await supabase.from('report_updates').insert([
          {
            report_id: inserted.id,
            author_id: rep.student_id,
            new_status: 'PENDING',
            note: 'Complaint submitted by student',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
          ...(rep.reviewed_by
            ? [
                {
                  report_id: inserted.id,
                  author_id: rep.reviewed_by,
                  new_status: 'ASSIGNED',
                  note: 'Reviewed and assigned to technician',
                  created_at: rep.reviewed_at,
                },
              ]
            : []),
          ...(rep.started_at
            ? [
                {
                  report_id: inserted.id,
                  author_id: rep.current_technician_id,
                  new_status: 'IN_PROGRESS',
                  note: 'Technician commenced work on site',
                  created_at: rep.started_at,
                },
              ]
            : []),
          ...(rep.completed_at
            ? [
                {
                  report_id: inserted.id,
                  author_id: rep.current_technician_id,
                  new_status: rep.status === 'REJECTED' ? 'REJECTED' : 'AWAITING_VERIFICATION',
                  note: rep.completion_notes || 'Technician submitted job for verification',
                  created_at: rep.completed_at,
                },
              ]
            : []),
          ...(rep.resolved_at
            ? [
                {
                  report_id: inserted.id,
                  author_id: rep.verified_by,
                  new_status: 'RESOLVED',
                  note: 'Supervisor verified work and signed off resolution',
                  created_at: rep.resolved_at,
                },
              ]
            : []),
        ])

        // Add sample comment
        if (rep.status === 'IN_PROGRESS' || rep.status === 'AWAITING_VERIFICATION') {
          await supabase.from('report_comments').insert({
            report_id: inserted.id,
            author_id: rep.current_technician_id,
            body: 'On site inspecting the hardware now. Estimated completion within 2 hours.',
            is_internal: false,
          })
        }
      }
    } else {
      console.log(`Report already exists: ${rep.reference_number}`)
    }
  }

  console.log('\n========================================')
  console.log('✅ ALL SEED DATA CREATED SUCCESSFULLY!')
  console.log('========================================')
}

main().catch(console.error)
