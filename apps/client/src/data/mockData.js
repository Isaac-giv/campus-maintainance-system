// apps/client/src/data/mockData.js
// Realistic initial data for Cosmopolitan University Campus Maintenance System
// Matches the Greenwood/Cosmopolitan UI mockup specifications.

export const MOCK_HOSTEL_BLOCKS = [
  {
    id: 'blk-a',
    name: 'Hostel Block A',
    code: 'BLK-A',
    description: 'Undergraduate Hostel A',
  },
  {
    id: 'blk-b',
    name: 'Hostel Block B',
    code: 'BLK-B',
    description: 'Undergraduate Hostel B',
  },
  {
    id: 'blk-c',
    name: 'Hostel Block C',
    code: 'BLK-C',
    description: 'Undergraduate Hostel C',
  },
  {
    id: 'blk-d',
    name: 'Hostel Block D',
    code: 'BLK-D',
    description: 'Undergraduate Hostel D',
  },
]

export const MOCK_CATEGORIES = [
  { id: 'cat-plumbing', name: 'Plumbing', icon: 'Droplets' },
  { id: 'cat-electrical', name: 'Electrical', icon: 'Zap' },
  { id: 'cat-carpentry', name: 'Carpentry', icon: 'Hammer' },
  { id: 'cat-sanitation', name: 'Sanitation', icon: 'Trash2' },
  { id: 'cat-general', name: 'General Maintenance', icon: 'Wrench' },
  { id: 'cat-network', name: 'Network / Connectivity', icon: 'Wifi' },
]

export const MOCK_WORKERS = [
  {
    id: 'usr-worker-1',
    name: 'Engr. Musa Sani',
    email: 'musa.sani@cosmopolitan.edu.ng',
    role: 'WORKER',
    specialty: 'Electrical & Power Systems',
    activeJobs: 2,
  },
  {
    id: 'usr-worker-2',
    name: 'Emeka Okafor',
    email: 'emeka.okafor@cosmopolitan.edu.ng',
    role: 'WORKER',
    specialty: 'Plumbing & Water Infrastructure',
    activeJobs: 1,
  },
  {
    id: 'usr-worker-3',
    name: 'Babajide Adeleke',
    email: 'babajide.adeleke@cosmopolitan.edu.ng',
    role: 'WORKER',
    specialty: 'Carpentry & Structural Repairs',
    activeJobs: 0,
  },
]

export const MOCK_USERS = [
  // ── CORE DEMO PERSONAS ──────────────────────────────────────────
  {
    id: 'usr-student-chinwe',
    email: 'chinwe.eze@cosmopolitan.edu.ng',
    fullName: 'Chinwe Eze',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: '102',
    matricNumber: 'CU/2023/1042',
    department: 'Computer Science',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-supervisor-bello',
    email: 'bello.ahmed@cosmopolitan.edu.ng',
    fullName: 'Mr. Bello Ahmed',
    role: 'SUPERVISOR',
    hostelBlock: 'Hostel Block A & B',
    hostelBlockId: 'blk-a',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-worker-musa',
    email: 'musa.sani@cosmopolitan.edu.ng',
    fullName: 'Engr. Musa Sani',
    role: 'WORKER',
    specialty: 'Electrical Specialist',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-admin-ibrahim',
    email: 'admin@cosmopolitan.edu.ng',
    fullName: 'Dr. Ibrahim Aliyu',
    role: 'ADMIN',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-unverified',
    email: 'tunde.adeleke@cosmopolitan.edu.ng',
    fullName: 'Tunde Adeleke',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block C',
    hostelBlockId: 'blk-c',
    roomNumber: '204',
    matricNumber: 'CU/2026/0891',
    department: 'Civil Engineering',
    isVerified: false,
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  },

  // ── HOSTEL BLOCK A STUDENTS (Female Undergraduate) ─────────────
  {
    id: 'usr-student-amina',
    email: 'amina.bello@cosmopolitan.edu.ng',
    fullName: 'Amina Bello',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: '105',
    matricNumber: 'CU/2023/1105',
    department: 'Electrical Engineering',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-zainab',
    email: 'zainab.yusuf@cosmopolitan.edu.ng',
    fullName: 'Zainab Yusuf',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: '201',
    matricNumber: 'CU/2024/0201',
    department: 'Faculty of Law',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-ngozi',
    email: 'ngozi.okonjo@cosmopolitan.edu.ng',
    fullName: 'Ngozi Okonjo',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: '214',
    matricNumber: 'CU/2024/0214',
    department: 'Economics',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-fatimah',
    email: 'fatimah.abdullahi@cosmopolitan.edu.ng',
    fullName: 'Fatimah Abdullahi',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: '303',
    matricNumber: 'CU/2022/3303',
    department: 'Medicine & Surgery',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },

  // ── HOSTEL BLOCK B STUDENTS (Male Undergraduate) ───────────────
  {
    id: 'usr-student-chidi',
    email: 'chidi.obi@cosmopolitan.edu.ng',
    fullName: 'Chidi Obi',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: '101',
    matricNumber: 'CU/2023/2101',
    department: 'Mechanical Engineering',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-usman',
    email: 'usman.danladi@cosmopolitan.edu.ng',
    fullName: 'Usman Danladi',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: '110',
    matricNumber: 'CU/2024/2110',
    department: 'Architecture',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-femi',
    email: 'femi.adebayo@cosmopolitan.edu.ng',
    fullName: 'Femi Adebayo',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: '208',
    matricNumber: 'CU/2023/2208',
    department: 'Software Engineering',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-emeka-n',
    email: 'emeka.nnamdi@cosmopolitan.edu.ng',
    fullName: 'Emeka Nnamdi',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: '215',
    matricNumber: 'CU/2024/2215',
    department: 'Accounting',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-tariq',
    email: 'tariq.almansoor@cosmopolitan.edu.ng',
    fullName: 'Tariq Al-Mansoor',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: '312',
    matricNumber: 'CU/2022/2312',
    department: 'Cybersecurity',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },

  // ── HOSTEL BLOCK C STUDENTS (Senior / Postgraduate) ────────────
  {
    id: 'usr-student-halima',
    email: 'halima.mohammed@cosmopolitan.edu.ng',
    fullName: 'Halima Mohammed',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block C',
    hostelBlockId: 'blk-c',
    roomNumber: '108',
    matricNumber: 'CU/2022/1108',
    department: 'Mass Communication',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-kelechi',
    email: 'kelechi.iheanacho@cosmopolitan.edu.ng',
    fullName: 'Kelechi Iheanacho',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block C',
    hostelBlockId: 'blk-c',
    roomNumber: '301',
    matricNumber: 'CU/2023/1301',
    department: 'Biochemistry',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-damilola',
    email: 'damilola.davies@cosmopolitan.edu.ng',
    fullName: 'Damilola Davies',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block C',
    hostelBlockId: 'blk-c',
    roomNumber: '402',
    matricNumber: 'CU/2024/1402',
    department: 'Artificial Intelligence',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },

  // ── HOSTEL BLOCK D STUDENTS (Freshmen Intake) ──────────────────
  {
    id: 'usr-student-samuel',
    email: 'samuel.kalu@cosmopolitan.edu.ng',
    fullName: 'Samuel Kalu',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block D',
    hostelBlockId: 'blk-d',
    roomNumber: '104',
    matricNumber: 'CU/2026/0104',
    department: 'Mechatronics',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-blessing',
    email: 'blessing.david@cosmopolitan.edu.ng',
    fullName: 'Blessing David',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block D',
    hostelBlockId: 'blk-d',
    roomNumber: '205',
    matricNumber: 'CU/2026/0205',
    department: 'Nursing Science',
    isVerified: false,
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-ibrahim-m',
    email: 'ibrahim.musa@cosmopolitan.edu.ng',
    fullName: 'Ibrahim Musa',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block D',
    hostelBlockId: 'blk-d',
    roomNumber: '306',
    matricNumber: 'CU/2026/0306',
    department: 'Pharmacy',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-student-aisha',
    email: 'aisha.garba@cosmopolitan.edu.ng',
    fullName: 'Aisha Garba',
    role: 'STUDENT',
    hostelBlock: 'Hostel Block D',
    hostelBlockId: 'blk-d',
    roomNumber: '310',
    matricNumber: 'CU/2026/0310',
    department: 'International Relations',
    isVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
]

// Mock reports directly reflecting the items seen in the mockup screens:
// - Faulty Light (Block A) -> In Progress
// - Leaking Pipe (Block B) -> Resolved
// - Broken Chair (Block C) -> Pending
// - Water Seepage (Block A) -> In Progress
// - Faulty AC (Block B) -> Resolved
// - Broken Door (Block C) -> Pending
export const INITIAL_REPORTS = [
  {
    id: 'rep-001',
    trackingCode: 'CU-2026-000042',
    title: 'Faulty Light',
    description:
      'Fluorescent ceiling light in room flickering constantly and buzzing, making it impossible to read at night.',
    category: 'Electrical',
    categoryId: 'cat-electrical',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: '102',
    specificLocationDetails: 'Above study desk near the window',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    studentId: 'usr-student-chinwe',
    studentName: 'Chinwe Eze',
    currentWorkerId: 'usr-worker-musa',
    workerName: 'Engr. Musa Sani',
    createdAt: '2026-04-26T10:15:00Z',
    photoUrl:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-26T10:15:00Z',
        notes: 'Report submitted by student',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-26T11:00:00Z',
        notes: 'Assigned to Engr. Musa Sani',
      },
      {
        status: 'IN_PROGRESS',
        timestamp: '2026-04-26T14:30:00Z',
        notes: 'Parts gathered, inspection ongoing',
      },
    ],
  },
  {
    id: 'rep-002',
    trackingCode: 'CU-2026-000038',
    title: 'Leaking Pipe',
    description:
      'Joint under the washbasin in the hostel bathroom is leaking water onto the floor, causing slippery hazards.',
    category: 'Plumbing',
    categoryId: 'cat-plumbing',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: '205',
    specificLocationDetails: 'Common bathroom, 2nd sink from entrance',
    status: 'RESOLVED',
    priority: 'HIGH',
    studentId: 'usr-student-chinwe',
    studentName: 'Chinwe Eze',
    currentWorkerId: null,
    workerName: 'Emeka Okafor',
    createdAt: '2026-04-24T08:45:00Z',
    photoUrl:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    resolutionPhotoUrl:
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    workerNotes:
      'Replaced rubber gasket and tightened PVC connector pipe. Tested with running water for 10 minutes with no leaks.',
    supervisorNotes: 'Inspected by Mr. Bello Ahmed. Clean job and verified resolved.',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-04-24T08:45:00Z', notes: 'Report submitted' },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-24T09:20:00Z',
        notes: 'Assigned to Emeka Okafor',
      },
      {
        status: 'IN_PROGRESS',
        timestamp: '2026-04-24T11:00:00Z',
        notes: 'Worker on site',
      },
      {
        status: 'AWAITING_VERIFICATION',
        timestamp: '2026-04-24T15:30:00Z',
        notes: 'Job marked completed with evidence',
      },
      {
        status: 'RESOLVED',
        timestamp: '2026-04-25T09:00:00Z',
        notes: 'Sign-off approved by supervisor',
      },
    ],
  },
  {
    id: 'rep-003',
    trackingCode: 'CU-2026-000035',
    title: 'Broken Chair',
    description:
      'Wooden study chair leg has cracked along the joint and is wobbling dangerously. Needs replacement or repair.',
    category: 'Carpentry',
    categoryId: 'cat-carpentry',
    hostelBlock: 'Hostel Block C',
    hostelBlockId: 'blk-c',
    roomNumber: '112',
    specificLocationDetails: 'Room 112 main study table',
    status: 'PENDING',
    priority: 'LOW',
    studentId: 'usr-student-chinwe',
    studentName: 'Chinwe Eze',
    currentWorkerId: null,
    workerName: null,
    createdAt: '2026-04-22T16:10:00Z',
    photoUrl:
      'https://images.unsplash.com/photo-1580481077195-c22ae00a4dfb?auto=format&fit=crop&w=600&q=80',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-22T16:10:00Z',
        notes: 'Awaiting supervisor triage',
      },
    ],
  },
  {
    id: 'rep-004',
    trackingCode: 'CU-2026-000049',
    title: 'Water Seepage',
    description:
      'Water seepage visible along the corridor wall near Block A stairwell after recent rainfall.',
    category: 'General Maintenance',
    categoryId: 'cat-general',
    hostelBlock: 'Hostel Block A',
    hostelBlockId: 'blk-a',
    roomNumber: 'Hallway',
    specificLocationDetails: 'Ground floor west wing staircase',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    studentId: 'usr-student-chinwe',
    studentName: 'Chinwe Eze',
    currentWorkerId: 'usr-worker-musa',
    workerName: 'Engr. Musa Sani',
    createdAt: '2026-04-27T09:00:00Z',
    photoUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-04-27T09:00:00Z', notes: 'Report submitted' },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-27T10:30:00Z',
        notes: 'Assigned for sealant inspection',
      },
      { status: 'IN_PROGRESS', timestamp: '2026-04-27T13:00:00Z', notes: 'Work started' },
    ],
  },
  {
    id: 'rep-005',
    trackingCode: 'CU-2026-000051',
    title: 'Faulty AC Unit',
    description:
      'Common study lounge air conditioner is blowing warm air and showing error code E3.',
    category: 'Electrical',
    categoryId: 'cat-electrical',
    hostelBlock: 'Hostel Block B',
    hostelBlockId: 'blk-b',
    roomNumber: 'Study Lounge',
    specificLocationDetails: 'Floor 1 common study hall',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    studentId: 'usr-student-chinwe',
    studentName: 'Chinwe Eze',
    currentWorkerId: null,
    workerName: 'Engr. Musa Sani',
    createdAt: '2026-04-20T11:20:00Z',
    photoUrl:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    workerNotes: 'Cleaned compressor coils and recharged R410A refrigerant.',
    supervisorNotes: 'Verified cooling to 20C. Completed.',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-04-20T11:20:00Z', notes: 'Report submitted' },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-20T12:00:00Z',
        notes: 'Assigned to Engr. Musa',
      },
      {
        status: 'IN_PROGRESS',
        timestamp: '2026-04-20T14:00:00Z',
        notes: 'Inspection ongoing',
      },
      {
        status: 'RESOLVED',
        timestamp: '2026-04-21T10:00:00Z',
        notes: 'Verified working',
      },
    ],
  },
  {
    id: 'rep-006',
    trackingCode: 'CU-2026-000055',
    title: 'Broken Door Hinge',
    description:
      'Main entrance door to Room 304 cannot be locked securely because top hinge screws have stripped out.',
    category: 'Carpentry',
    categoryId: 'cat-carpentry',
    hostelBlock: 'Hostel Block C',
    hostelBlockId: 'blk-c',
    roomNumber: '304',
    specificLocationDetails: 'Room 304 door frame',
    status: 'PENDING',
    priority: 'HIGH',
    studentId: 'usr-student-chinwe',
    studentName: 'Chinwe Eze',
    currentWorkerId: null,
    workerName: null,
    createdAt: '2026-04-28T07:15:00Z',
    photoUrl:
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-28T07:15:00Z',
        notes: 'Submitted — urgent security issue',
      },
    ],
  },
]
