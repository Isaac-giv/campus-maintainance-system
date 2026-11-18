// apps/server/src/routes/masterData.routes.js
// Master-data reference endpoints: hostel blocks, rooms, issue categories for Cosmopolitan University.

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/rbac.middleware.js'
import { ROLES } from '@campus/shared'

const router = Router()

// Default Cosmopolitan University master data
const HOSTEL_BLOCKS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Hostel Block A',
    code: 'BLK-A',
    description: 'Undergraduate Hostel A',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Hostel Block B',
    code: 'BLK-B',
    description: 'Undergraduate Hostel B',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Hostel Block C',
    code: 'BLK-C',
    description: 'Undergraduate Hostel C',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Hostel Block D',
    code: 'BLK-D',
    description: 'Undergraduate Hostel D',
  },
]

const ISSUE_CATEGORIES = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    name: 'Plumbing',
    description: 'Leaking pipes, washbasin, drainage, and water supply issues',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    name: 'Electrical',
    description: 'Lighting, power sockets, ceiling fans, AC units, and switches',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    name: 'Carpentry',
    description: 'Study tables, chairs, door locks, wardrobes, and window frames',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    name: 'Sanitation',
    description: 'Cleaning, waste disposal, pest control, and hygiene facilities',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    name: 'General Maintenance',
    description: 'Painting, roof leaks, masonry, structural repairs, and fixtures',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    name: 'Network / Connectivity',
    description: 'Campus Wi-Fi connectivity and ethernet wall ports',
  },
]

// ── Hostel blocks ───────────────────────────────────────────────

// GET /api/v1/master-data/hostel-blocks
// Public for registration dropdown
router.get('/hostel-blocks', (_req, res) => {
  res.json({
    success: true,
    data: HOSTEL_BLOCKS,
  })
})

// GET /api/v1/master-data/hostel-blocks/:blockId/rooms
router.get('/hostel-blocks/:blockId/rooms', authenticate, (req, res) => {
  const { blockId } = req.params
  const rooms = []
  for (let floor = 1; floor <= 3; floor++) {
    for (let r = 1; r <= 8; r++) {
      rooms.push({
        id: `room-${blockId}-${floor}0${r}`,
        hostelBlockId: blockId,
        roomNumber: `${floor}0${r}`,
        floor,
      })
    }
  }
  res.json({ success: true, data: rooms })
})

// POST /api/v1/master-data/hostel-blocks — ADMIN only
router.post('/hostel-blocks', authenticate, authorize(ROLES.ADMIN), (req, res) => {
  const { name, code, description } = req.body
  const newBlock = { id: `block-${Date.now()}`, name, code, description }
  HOSTEL_BLOCKS.push(newBlock)
  res.status(201).json({ success: true, data: newBlock })
})

// ── Issue categories ────────────────────────────────────────────

// GET /api/v1/master-data/categories
// Public for report-submission dropdown
router.get('/categories', (_req, res) => {
  res.json({
    success: true,
    data: ISSUE_CATEGORIES,
  })
})

// POST /api/v1/master-data/categories — ADMIN only
router.post('/categories', authenticate, authorize(ROLES.ADMIN), (req, res) => {
  const { name, description } = req.body
  const newCat = { id: `cat-${Date.now()}`, name, description }
  ISSUE_CATEGORIES.push(newCat)
  res.status(201).json({ success: true, data: newCat })
})

export default router
