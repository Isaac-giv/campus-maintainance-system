// apps/server/prisma/seed.js
// Seed script for Cosmopolitan University Campus Maintenance System.
// Seeds reference data: hostel blocks, rooms, and issue categories.
// Also seeds a placeholder ADMIN profile record.
//
// IMPORTANT:
//   - This seed script uses PLACEHOLDER UUIDs. Real admin user IDs must
//     come from Supabase Auth — replace ADMIN_USER_ID before running.
//   - Run from the apps/server directory:
//       node prisma/seed.js
//   - Or via npm script: npm run seed (defined in apps/server/package.json)
//   - Requires DATABASE_URL environment variable (see .env.example).
//   - Uses upsert to be idempotent — safe to re-run.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// ── Placeholder admin UUID ───────────────────────────────────────
// MUST be replaced with the actual Supabase Auth user UUID of your admin.
// Create the admin user in Supabase Auth first, then paste their UUID here.
const ADMIN_AUTH_UUID = '00000000-0000-0000-0000-000000000001'
const ADMIN_EMAIL = 'admin@cosmopolitan.edu.ng'

// ── Hostel block definitions ─────────────────────────────────────
const HOSTEL_BLOCKS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Block A',
    code: 'BLK-A',
    description: 'Male undergraduate hostel — ground and first floors',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Block B',
    code: 'BLK-B',
    description: 'Male undergraduate hostel — second and third floors',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Block C',
    code: 'BLK-C',
    description: 'Female undergraduate hostel — ground and first floors',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Block D',
    code: 'BLK-D',
    description: 'Female undergraduate hostel — second and third floors',
  },
]

// ── Room definitions per block ───────────────────────────────────
// Generates rooms 101–110 for floor 1, 201–210 for floor 2, etc.
function generateRooms(hostelBlockId, floors = 2, roomsPerFloor = 10) {
  const rooms = []
  for (let floor = 1; floor <= floors; floor++) {
    for (let room = 1; room <= roomsPerFloor; room++) {
      const roomNumber = `${floor}${String(room).padStart(2, '0')}`
      rooms.push({
        hostelBlockId,
        roomNumber,
        floor,
        capacity: 2,
      })
    }
  }
  return rooms
}

// ── Issue categories ─────────────────────────────────────────────
const ISSUE_CATEGORIES = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    name: 'Plumbing',
    description: 'Leaking pipes, blocked drains, broken taps, toilet faults',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    name: 'Electrical',
    description: 'Power failures, broken sockets, faulty lighting, wiring issues',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    name: 'Carpentry',
    description: 'Broken doors, damaged furniture, window frame repairs',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    name: 'Sanitation',
    description: 'Waste disposal, cleaning deficiencies, pest control',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    name: 'General Maintenance',
    description: 'Painting, structural repairs, and miscellaneous issues',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    name: 'Network / Connectivity',
    description: 'Campus WiFi, network socket, or connectivity faults in the hostel',
  },
]

async function main() {
  console.log('🌱  Starting seed...')

  // ── Admin profile placeholder ──────────────────────────────────
  // This record will be overwritten when the real admin logs in and
  // their profile is synced. The UUID must match a Supabase Auth user.
  console.log('  → Upserting admin profile placeholder...')
  await prisma.profile.upsert({
    where: { id: ADMIN_AUTH_UUID },
    update: {},
    create: {
      id: ADMIN_AUTH_UUID,
      email: ADMIN_EMAIL,
      fullName: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // ── Hostel blocks ──────────────────────────────────────────────
  console.log('  → Upserting hostel blocks...')
  for (const block of HOSTEL_BLOCKS) {
    await prisma.hostelBlock.upsert({
      where: { id: block.id },
      update: { name: block.name, description: block.description },
      create: block,
    })
  }

  // ── Hostel rooms ───────────────────────────────────────────────
  console.log('  → Generating and upserting hostel rooms...')
  for (const block of HOSTEL_BLOCKS) {
    const rooms = generateRooms(block.id)
    for (const room of rooms) {
      await prisma.hostelRoom.upsert({
        where: {
          hostelBlockId_roomNumber: {
            hostelBlockId: room.hostelBlockId,
            roomNumber: room.roomNumber,
          },
        },
        update: { floor: room.floor, capacity: room.capacity },
        create: room,
      })
    }
  }
  const roomCount = HOSTEL_BLOCKS.length * 2 * 10
  console.log(
    `     Created/verified ${roomCount} rooms across ${HOSTEL_BLOCKS.length} blocks.`
  )

  // ── Issue categories ───────────────────────────────────────────
  console.log('  → Upserting issue categories...')
  for (const category of ISSUE_CATEGORIES) {
    await prisma.issueCategory.upsert({
      where: { id: category.id },
      update: { name: category.name, description: category.description },
      create: category,
    })
  }

  console.log('✅  Seed complete.')
  console.log('')
  console.log('  NEXT STEPS:')
  console.log('  1. Create your admin user in Supabase Auth Dashboard.')
  console.log('  2. Copy the admin user UUID.')
  console.log('  3. Update ADMIN_AUTH_UUID in prisma/seed.js.')
  console.log('  4. Run the seed again: node prisma/seed.js')
  console.log('  5. Use PATCH /api/v1/admin/users/:id/role to assign roles.')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
