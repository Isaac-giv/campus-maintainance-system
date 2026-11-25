# Cosmopolitan University — Campus Maintenance Reporting & Tracking System

A web application where students report campus maintenance issues, supervisors review and assign them, technicians carry out and document the work, and administrators manage users, departments and configuration.

| Interface         | Role                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Student**       | Report maintenance issues with photographs, track progress, receive updates                             |
| **Supervisor**    | Review, approve/reject, categorise, prioritise, assign technicians, verify completed work               |
| **Technician**    | Accept jobs, start work, record progress, submit completion notes and photos, handle returned work      |
| **Administrator** | Manage users, roles, departments, specializations, categories, buildings, locations; analytics & export |

## Architecture

```
React (Vite, Tailwind)  ──supabase-js──►  Supabase
  apps/client                              ├─ Auth (email/password, reset)
                                           ├─ Postgres: tables + RLS + RPC functions (supabase/schema.sql)
                                           ├─ Storage: report-photos (private), avatars (public)
                                           ├─ Realtime: notifications, report updates
                                           └─ Edge Function: admin-users (service-role user admin)
packages/shared  – roles, statuses, priorities, validation (shared by the UI)
```

- **Reads** go directly to tables and are filtered by Row Level Security.
- **Every workflow change** (submit, review, assign, accept, start, complete, verify…) is a `SECURITY DEFINER` Postgres function that validates input, checks the caller's role/ownership, enforces the status state machine, writes status history and creates notifications. Clients cannot insert or update reports directly.
- **Privileged auth operations** (creating staff accounts, password resets, banning) run in the `admin-users` Edge Function with the service-role key, after verifying the caller is an active admin.

Further documentation:

- [docs/DATABASE.md](docs/DATABASE.md) — schema, state machine, RLS
- [docs/API.md](docs/API.md) — RPC functions and Edge Function
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) — how each role uses the system
- [docs/TESTING.md](docs/TESTING.md) — automated tests and QA checklist

## Project structure

```
apps/client/src
  components/   layout, ui (design system), reports (shared report views), charts
  context/      AuthContext, NotificationContext
  pages/        auth, shared (profile, notifications), student, supervisor, technician, admin
  routes/       AppRoutes, role guards
  services/     api.js – all Supabase access
packages/shared/src  constants + validation
supabase/
  schema.sql            full database schema, RLS, RPC API, storage, triggers
  seed.sql              departments, specializations, categories, buildings, locations
  functions/admin-users Edge Function
  tests/                database workflow tests (PGlite)
```

## Local setup

Requirements: Node.js 20+, a Supabase project (free tier is fine).

1. **Install**
   ```bash
   npm install
   ```
2. **Create the database** — in Supabase Dashboard → SQL Editor run, in order:
   1. `supabase/schema.sql`
   2. `supabase/seed.sql`
3. **Configure Auth** — Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
4. **Environment** — copy `apps/client/.env.example` to `apps/client/.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
5. **Deploy the Edge Function** (needed for creating staff accounts and resetting user access):
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase functions deploy admin-users
   ```
6. **Create the first administrator** — register through the app (or Dashboard → Authentication → Add user), then run in the SQL editor:
   ```sql
   update public.profiles set role = 'ADMIN' where email = 'you@example.com';
   insert into public.staff_profiles (user_id)
     select id from public.profiles where email = 'you@example.com' on conflict do nothing;
   ```
   Then sign in and create supervisors and technicians from **Administrator → Users**.
7. **Run**
   ```bash
   npm run dev          # http://localhost:5173
   ```

## Scripts

| Command           | Purpose                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `npm run dev`     | Start the client dev server                                              |
| `npm run build`   | Production build (`apps/client/dist`)                                    |
| `npm run lint`    | ESLint for client and shared packages                                    |
| `npm run test:db` | Run the database workflow/permission tests against an in-memory Postgres |
| `npm run format`  | Prettier                                                                 |

## Deployment

### Production Supabase

1. Create a separate production project; run `schema.sql` then `seed.sql`.
2. Authentication → URL Configuration: set Site URL and Redirect URLs to the production domain (e.g. `https://maintenance.example.edu/**`).
3. Authentication → Providers → Email: keep **Confirm email** enabled; configure custom SMTP for reliable delivery.
4. Deploy the Edge Function: `npx supabase functions deploy admin-users --project-ref <prod-ref>`.
5. Bootstrap the first admin (step 6 above).

### Frontend (Vercel — config included)

1. Import the repository in Vercel. Root `vercel.json` sets the build command (`npm run build --workspace=@campus/client`), output directory (`apps/client/dist`) and SPA rewrites.
2. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (production values).
3. Deploy, then smoke-test using the checklist in [docs/TESTING.md](docs/TESTING.md).

Netlify also works: build `npm run build --workspace=@campus/client`, publish `apps/client/dist`; `apps/client/public/_redirects` handles SPA routing.

The backend is fully hosted by Supabase (database, auth, storage, realtime, Edge Function); there is no separate server to deploy.

### Security notes

- Only the **anon** key is used in the browser. Never expose the service-role key.
- Public sign-up always creates a `STUDENT`. Other roles can only be granted by an admin (via `app_metadata` in the Edge Function or `admin_update_user`).
- Deactivated users are banned in Auth and blocked by every RLS policy and RPC.
- Report photos are in a private bucket and served with short-lived signed URLs only to users who can view the report.
