// Database integration test: runs schema.sql + seed.sql on an in-memory Postgres (PGlite)
// with minimal Supabase auth/storage stubs, then exercises the full complaint workflow,
// authorization rules, RLS visibility and notification triggers.
// Run: npm run test:db

import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
process.on('unhandledRejection', (e) => { console.error('FAILED:', e.message, e.where || ''); process.exit(1) })

const root = new URL('../', import.meta.url)
const db = new PGlite()

// Minimal Supabase stubs
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, raw_app_meta_data jsonb);
  create or replace function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create or replace function storage.foldername(name text) returns text[] language sql as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
  create publication supabase_realtime;
`)

await db.exec(fs.readFileSync(new URL('schema.sql', root), 'utf8'))
await db.exec(fs.readFileSync(new URL('seed.sql', root), 'utf8'))
console.log('schema + seed OK')

const ids = { student: crypto.randomUUID(), sup: crypto.randomUUID(), tech: crypto.randomUUID(), admin: crypto.randomUUID(), evil: crypto.randomUUID() }
const mk = (id, email, meta, app = {}) =>
  db.query('insert into auth.users values ($1,$2,$3,$4)', [id, email, JSON.stringify(meta), JSON.stringify(app)])
await mk(ids.student, 's@x.com', { full_name: 'Stu Dent', matric_number: 'cu/1', building_id: 'not-a-uuid' })
await mk(ids.evil, 'e@x.com', { full_name: 'Evil', role: 'ADMIN' }) // user_metadata role must be ignored
await mk(ids.sup, 'sup@x.com', { full_name: 'Super Visor' }, { role: 'SUPERVISOR' })
await mk(ids.tech, 't@x.com', { full_name: 'Tech Nician' }, { role: 'TECHNICIAN' })
await mk(ids.admin, 'a@x.com', { full_name: 'Ad Min' }, { role: 'ADMIN' })

const roles = (await db.query('select email, role from profiles order by email')).rows
console.log(roles)
if (roles.find((r) => r.email === 'e@x.com').role !== 'STUDENT') throw new Error('privilege escalation!')

// Run as a user with RLS enforced
async function as(uid, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.sub', '${uid}', false); set role authenticated;`)
  try {
    return (await db.query(sql, params)).rows
  } finally {
    await db.exec('reset role')
  }
}
async function expectFail(label, fn) {
  try {
    await fn()
    throw new Error('EXPECTED FAILURE: ' + label)
  } catch (e) {
    if (e.message.startsWith('EXPECTED')) throw e
    console.log('  ✓ rejected:', label, '→', e.message)
  }
}
await db.exec(`grant usage on schema public to authenticated; grant select, insert, update, delete on all tables in schema public to authenticated;
  grant usage, select on all sequences in schema public to authenticated; grant execute on all functions in schema public to authenticated;
  grant usage on schema auth to authenticated; grant execute on all functions in schema auth to authenticated;
  revoke execute on function public._transition(uuid, public.report_status, text) from authenticated;
  revoke execute on function public._notify(uuid, uuid, text, text, text) from authenticated;`)

const cat = (await db.query(`select id from maintenance_categories where name='Plumbing'`)).rows[0].id
const bld = (await db.query(`select id from buildings where code='HBA'`)).rows[0].id

await db.exec(`update technician_specializations set technician_id = technician_id`)
await as(ids.admin, `select admin_set_specializations($1, array(select id from specializations where name='Plumbing'))`, [ids.tech])

const [rep] = await as(ids.student, `select * from submit_report('Leaking sink pipe', 'Water is leaking under the sink constantly', $1, $2, 'Room 101')`, [cat, bld])
console.log('submitted', rep.reference_number, rep.status)

await expectFail('student cannot approve', () => as(ids.student, `select review_report($1, true)`, [rep.id]))
await expectFail('technician cannot submit report', () => as(ids.tech, `select submit_report('Leaking sink pipe','Water is leaking everywhere',$1,$2,'x')`, [cat, bld]))
await expectFail('invalid title', () => as(ids.student, `select submit_report('abc','Water is leaking everywhere',$1,$2,'x')`, [cat, bld]))
await expectFail('reject needs reason', () => as(ids.sup, `select review_report($1, false, '')`, [rep.id]))
await expectFail('direct table insert blocked', () => as(ids.student, `insert into maintenance_reports (reference_number,title,description,category_id,building_id,location_details,student_id) values ('X','Title ok','Description ok!!',$1,$2,'x',$3)`, [cat, bld, ids.student]))
const upd = await as(ids.student, `update maintenance_reports set status='RESOLVED' where id=$1 returning id`, [rep.id])
if (upd.length) throw new Error('student updated report directly!')
console.log('  ✓ rejected: direct update affects 0 rows')
await expectFail('internal helper not callable', () => as(ids.student, `select _transition($1,'RESOLVED')`, [rep.id]))

await as(ids.sup, `select review_report($1, true, 'Looks valid', 'HIGH')`, [rep.id])
await expectFail('tech cannot start unassigned', () => as(ids.tech, `select start_job($1)`, [rep.id]))
await as(ids.sup, `select assign_technician($1, $2, 'Bring a wrench')`, [rep.id, ids.tech])
await as(ids.tech, `select accept_job($1)`, [rep.id])
await as(ids.tech, `select start_job($1)`, [rep.id])
await as(ids.tech, `select add_report_update($1, 'Replaced washer, testing now')`, [rep.id])
await expectFail('photo path from other user', () => as(ids.tech, `select submit_completion($1, 'Fixed the leak completely', array[$2 || '/a.jpg'])`, [rep.id, ids.student]))
await as(ids.tech, `select submit_completion($1, 'Fixed the leak completely', array[$2 || '/a.jpg'])`, [rep.id, ids.tech])
await as(ids.sup, `select verify_completion($1, false, 'Still dripping slightly')`, [rep.id])
await as(ids.tech, `select start_job($1)`, [rep.id])
await as(ids.tech, `select submit_completion($1, 'Replaced whole trap, no drip')`, [rep.id])
await as(ids.sup, `select verify_completion($1, true, 'Confirmed on site')`, [rep.id])

const hist = await as(ids.student, `select from_status, to_status from status_history where report_id=$1 order by created_at`, [rep.id])
console.log('history (student view):', hist.map((h) => h.to_status).join(' → '))
const updates = await as(ids.student, `select type, is_internal from report_updates where report_id=$1`, [rep.id])
console.log('student-visible updates:', updates.length, 'internal visible:', updates.some((u) => u.is_internal))
if (updates.some((u) => u.is_internal)) throw new Error('internal note leaked')

const notes = (await db.query(`select p.email, n.type from notifications n join profiles p on p.id=n.user_id order by n.created_at`)).rows
console.log('notifications:', notes.map((n) => `${n.email}:${n.type}`).join(', '))

// RLS visibility
const evilSees = await as(ids.evil, `select id from maintenance_reports`)
const techSees = await as(ids.tech, `select id from maintenance_reports`)
console.log('other student sees', evilSees.length, 'reports; tech sees', techSees.length)
if (evilSees.length) throw new Error('RLS leak')
const evilNotifs = await as(ids.evil, `select id from notifications`)
if (evilNotifs.length) throw new Error('notification leak')

await as(ids.student, `select mark_all_notifications_read()`)
console.log('unread after mark all:', (await as(ids.student, `select count(*) from notifications where not is_read`))[0].count)

// Admin
await expectFail('non-admin cannot write categories', () => as(ids.sup, `insert into maintenance_categories (name) values ('Hack')`))
await as(ids.admin, `insert into maintenance_categories (name) values ('Roofing')`)
await expectFail('admin cannot demote self', () => as(ids.admin, `select admin_update_user($1,'Ad Min','STUDENT')`, [ids.admin]))
await as(ids.admin, `select admin_set_user_active($1, false)`, [ids.evil])
await expectFail('deactivated user blocked', () => as(ids.evil, `select submit_report('Leaking sink pipe','Water is leaking everywhere',$1,$2,'x')`, [cat, bld]))
await expectFail('student cannot read analytics', () => as(ids.student, `select report_analytics()`))
const [{ report_analytics: a }] = await as(ids.admin, `select report_analytics()`)
console.log('analytics:', JSON.stringify({ total: a.total, resolved: a.resolved, rate: a.resolution_rate, techs: a.technicians }))
const [{ report_analytics: a2 }] = await as(ids.admin, `select report_analytics('2000-01-01','2000-01-02', null)`)
console.log('filtered analytics total:', a2.total)
const act = await as(ids.admin, `select action, entity_type from activity_log`)
console.log('activity log entries:', act.length)

// Cancel flow + realtime select of storage policy
const [r2] = await as(ids.student, `select * from submit_report('Broken light bulb', 'Corridor light not working at night', $1, $2, 'Corridor')`, [cat, bld])
await as(ids.student, `select cancel_report($1, 'Fixed itself')`, [r2.id])
await expectFail('cannot cancel twice', () => as(ids.student, `select cancel_report($1)`, [r2.id]))
await expectFail('other student cannot cancel', () => as(ids.sup, `select cancel_report($1)`, [r2.id]))
await as(ids.student, `select update_my_profile('Stu Dent Jr', '+234 801 234 5678', null, 'CS', '300', $1, '101')`, [bld])
console.log('profile updated:', (await db.query(`select full_name, phone from profiles where id=$1`, [ids.student])).rows[0])
console.log('\nALL TESTS PASSED')
