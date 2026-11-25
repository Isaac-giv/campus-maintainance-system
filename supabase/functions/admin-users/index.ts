// supabase/functions/admin-users/index.ts
// Privileged user operations that require the service role key.
// Deploy:  supabase functions deploy admin-users
// Callers must be signed in as an active ADMIN; this is verified server-side.
//
// Actions (POST JSON body):
//   { action: 'create', email, password?, fullName, role, departmentId?, phone?,
//     staffNumber?, jobTitle?, matricNumber?, buildingId?, roomNumber? }
//   { action: 'reset_password', userId, redirectTo? }  -> sends recovery email
//   { action: 'set_password', userId, password }        -> sets a temporary password
//   { action: 'set_active', userId, active }            -> bans/unbans auth user + profile flag

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ROLES = ['STUDENT', 'SUPERVISOR', 'TECHNICIAN', 'ADMIN']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  // ── Authorization: caller must be an active ADMIN ──
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) return json({ error: 'Not signed in' }, 401)
  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', caller.user.id)
    .single()
  if (!callerProfile || callerProfile.role !== 'ADMIN' || !callerProfile.is_active) {
    return json({ error: 'You are not authorized to perform this action.' }, 403)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const log = (action: string, entityId: string, details: Record<string, unknown> = {}) =>
    admin.from('activity_log').insert({
      actor_id: caller.user.id,
      action,
      entity_type: 'profile',
      entity_id: entityId,
      details,
    })

  try {
    switch (body.action) {
      case 'create': {
        const email = String(body.email ?? '').trim().toLowerCase()
        const fullName = String(body.fullName ?? '').trim()
        const role = String(body.role ?? '')
        if (!EMAIL_RE.test(email)) return json({ error: 'A valid email is required.' }, 400)
        if (fullName.length < 2) return json({ error: 'Full name must be at least 2 characters.' }, 400)
        if (!ROLES.includes(role)) return json({ error: 'Invalid role.' }, 400)
        const password = body.password ? String(body.password) : undefined
        if (password && password.length < 8) {
          return json({ error: 'Password must be at least 8 characters.' }, 400)
        }

        const { data, error } = await admin.auth.admin.createUser({
          email,
          password: password ?? crypto.randomUUID() + 'Aa1!',
          email_confirm: true,
          app_metadata: { role },
          user_metadata: {
            full_name: fullName,
            phone: body.phone ?? null,
            matric_number: body.matricNumber ?? null,
            building_id: body.buildingId ?? null,
            room_number: body.roomNumber ?? null,
          },
        })
        if (error) return json({ error: error.message }, 400)
        const id = data.user.id

        await admin
          .from('profiles')
          .update({ department_id: body.departmentId || null, phone: body.phone || null })
          .eq('id', id)
        if (role !== 'STUDENT') {
          await admin
            .from('staff_profiles')
            .upsert({
              user_id: id,
              staff_number: body.staffNumber || null,
              job_title: body.jobTitle || null,
            })
        }
        // No password supplied: email the user a link to set their own.
        if (!password) {
          await admin.auth.resetPasswordForEmail(email, {
            redirectTo: (body.redirectTo as string) || undefined,
          })
        }
        await log('USER_CREATED', id, { role, email })
        return json({ id })
      }

      case 'reset_password': {
        const userId = String(body.userId ?? '')
        const { data, error } = await admin.auth.admin.getUserById(userId)
        if (error || !data.user?.email) return json({ error: 'User not found.' }, 404)
        const { error: e2 } = await admin.auth.resetPasswordForEmail(data.user.email, {
          redirectTo: (body.redirectTo as string) || undefined,
        })
        if (e2) return json({ error: e2.message }, 400)
        await log('USER_PASSWORD_RESET_SENT', userId)
        return json({ ok: true })
      }

      case 'set_password': {
        const userId = String(body.userId ?? '')
        const password = String(body.password ?? '')
        if (password.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400)
        const { error } = await admin.auth.admin.updateUserById(userId, { password })
        if (error) return json({ error: error.message }, 400)
        await log('USER_PASSWORD_SET', userId)
        return json({ ok: true })
      }

      case 'set_active': {
        const userId = String(body.userId ?? '')
        const active = Boolean(body.active)
        if (userId === caller.user.id && !active) {
          return json({ error: 'You cannot deactivate your own account.' }, 400)
        }
        const { error } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: active ? 'none' : '876000h',
        })
        if (error) return json({ error: error.message }, 400)
        await admin.from('profiles').update({ is_active: active }).eq('id', userId)
        await log(active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', userId)
        return json({ ok: true })
      }

      default:
        return json({ error: 'Unknown action' }, 400)
    }
  } catch (err) {
    return json({ error: (err as Error).message ?? 'Unexpected error' }, 500)
  }
})
