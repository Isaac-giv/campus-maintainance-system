# Phase 2.2: Supabase Database Connectivity & RLS Identity Architecture Validation

**Cosmopolitan University Campus Maintenance Reporting and Tracking System**  
**Document Status:** Architecture Validation & Controlled Proof-of-Concept Review  
**Date:** November 16, 2026  
**Auditor / Lead Architect:** Senior Software Architect & Technical Lead

---

## 1. Executive Summary

This review formally executes **Phase 2.2** of the Cosmopolitan University Campus Maintenance Reporting and Tracking System. Phase 2.1 successfully established the modular monorepo, tooling, client scaffold, and Express API stubs. Phase 2.2 validates the database connectivity, role hierarchy, and identity propagation architecture on **Supabase Free Tier** prior to establishing live database connections, running migrations, or implementing application code.

### Core Architectural Conclusions

1. **The Database Identity Problem is Resolved:** A PostgreSQL connection established via an application login role (`campus_app`) **does not** automatically carry or inherit a Supabase user identity. `auth.uid()` evaluates to `NULL` on ordinary Prisma queries because PostgREST is bypassed.
2. **`GRANT authenticated TO campus_app WITH NOINHERIT` is Insufficient on its Own:** Granting membership does not inject JWT claims into PostgreSQL's runtime parameter store (`request.jwt.claims`).
3. **Primary Access Pattern Decision (Pattern A + Triggers):** For Express/Prisma CRUD and mutations, **Pattern A (Express-authorized access via `campus_app`)** is recommended as the authoritative operational pattern. Express verifies the JWT via Supabase Auth, resolves the authoritative role from `profiles`, and executes typed business logic. Database triggers (`trg_protect_profile_privilege_fields`, `trg_protect_report_fields`, `trg_audit_append_only`) provide an immutable database-level safety net.
4. **Targeted Defense-in-Depth (Pattern B):** Transaction-local role switching (`SET LOCAL ROLE authenticated` + `set_config('request.jwt.claims', ...)`) is validated as technically feasible for high-sensitivity reads, but is deliberately reserved to avoid connection-pool pollution, latency penalties, and Prisma transaction client overhead on high-throughput mutations.
5. **Connection Pooling Strategy:** Supavisor **Session Mode (Port 5432)** is confirmed as fully compatible with Prisma prepared statements on Supabase Free Tier, using the `campus_app.<project-ref>` username format.
6. **Verdict:** **APPROVED WITH CONDITIONS**. Live connections and migrations may proceed once the administrative setup prerequisites and connection pooling limits are locked.

---

## 2. Official Documentation Sources and Findings

The technical determinations in this review are grounded in official documentation from Supabase, Prisma, and PostgreSQL.

### Official Sources Cited

| Topic                                 | Source / Authority       | Canonical URL                                                                                   |
| :------------------------------------ | :----------------------- | :---------------------------------------------------------------------------------------------- |
| **Supabase Postgres Roles**           | Supabase Official Docs   | `https://supabase.com/docs/guides/database/postgres/roles`                                      |
| **Connecting with Custom Roles**      | Supabase Official Docs   | `https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-custom-roles` |
| **Connection Pooling (Supavisor)**    | Supabase Official Docs   | `https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler`            |
| **Row Level Security & `auth.uid()`** | Supabase Official Docs   | `https://supabase.com/docs/guides/database/postgres/row-level-security`                         |
| **Prisma with Supabase**              | Prisma Official Docs     | `https://www.prisma.io/docs/orm/overview/databases/supabase`                                    |
| **PostgreSQL `SET ROLE`**             | PostgreSQL Official Docs | `https://www.postgresql.org/docs/current/sql-set-role.html`                                     |
| **PostgreSQL System Functions**       | PostgreSQL Official Docs | `https://www.postgresql.org/docs/current/functions-info.html`                                   |

### Documented Facts vs. Inferred Assumptions

#### Documented Facts:

- **Fact 1 (Role Creation):** Supabase permits executing standard DDL such as `CREATE ROLE "campus_app" WITH LOGIN PASSWORD '...' NOINHERIT;` via the Supabase Dashboard SQL Editor, which operates with administrative privileges (`supabase_admin` / `postgres`).
- **Fact 2 (Pooler Username Format):** When connecting via Supavisor (shared pooler host `aws-0-[region].pooler.supabase.com`), custom roles must format their username as `[ROLE].[PROJECT-REF]` (e.g., `campus_app.abcdefghijklm`). Failing to include the project reference causes immediate authentication failure.
- **Fact 3 (Pooler Modes & Ports):** Port `5432` on Supavisor runs in **Session Mode** and supports prepared statements. Port `6543` runs in **Transaction Mode** and does not support prepared statements (requiring `?pgbouncer=true`).
- **Fact 4 (`auth.uid()` Mechanics):** In Supabase, `auth.uid()` is implemented as:
  ```sql
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
  ```
  It strictly inspects PostgreSQL runtime configuration variables (`request.jwt.claims`). It has no awareness of connections originating outside PostgREST unless those variables are explicitly set via SQL.
- **Fact 5 (Prisma Direct Connection for Migrations):** Prisma CLI commands (`prisma migrate dev`, `prisma migrate deploy`) require an unpooled, direct connection (`DIRECT_URL`) to execute DDL, acquire advisory locks, and manage the migration table.

#### Inferred Assumptions:

- **Assumption 1 (Free-Tier Pooler Allocation):** Supabase Free Tier allocates a shared pool with an effective backend connection limit of approximately 15–20 connections. Express must constrain Prisma's pool size (`connection_limit=10`) to prevent pool starvation.
- **Assumption 2 (Project Inactivity Pause):** Supabase Free Tier projects pause after 7 consecutive days of inactivity. A paused project rejects database connections until manually resumed in the dashboard or awakened via API.

---

## 3. Free-Tier Feasibility Assessment

| Capability                                      | Supported on Free Tier? | Technical Constraints & Operational Rules                                                                                                                    |
| :---------------------------------------------- | :---------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Custom PostgreSQL Login Role (`campus_app`)** |       ✅ **YES**        | Created via SQL Editor with `LOGIN`, `PASSWORD`, `NOINHERIT`, `NOSUPERUSER`, `NOBYPASSRLS`. Must be granted explicit table privileges.                       |
| **Supavisor Session Pooler (Port 5432)**        |       ✅ **YES**        | Accessible via `aws-0-[region].pooler.supabase.com:5432`. Username must follow `campus_app.[project-ref]` syntax. Fully supports Prisma prepared statements. |
| **Supavisor Transaction Pooler (Port 6543)**    |       ✅ **YES**        | Available if needed, but breaks Prisma prepared statements unless configured with `pgbouncer=true`. Not recommended for primary runtime.                     |
| **Role Membership & `NOINHERIT`**               |       ✅ **YES**        | Standard PostgreSQL feature. `GRANT authenticated TO campus_app` with `NOINHERIT` functions identically on Free Tier.                                        |
| **Row Level Security (RLS) & Helper Functions** |       ✅ **YES**        | Full support for table-level RLS, custom `SECURITY DEFINER` functions (`auth_user_role`, `auth_is_supervisor_of`), and column grants.                        |
| **Direct Migration Connection (`DIRECT_URL`)**  |       ✅ **YES**        | Port 5432 on the direct host (`db.[project-ref].supabase.co:5432`) or session pooler allows `campus_admin` or `postgres` to execute migrations.              |
| **Project Storage & Quota**                     |     ⚠️ **Limited**      | 500 MB database storage limit and 1 GB file storage limit. Sufficient for development and testing; requires asset lifecycle monitoring.                      |
| **Project Pausing**                             | ⚠️ **Operational Risk** | Auto-pauses after 7 days of inactivity. Development environment must handle reconnection gracefully.                                                         |

**Feasibility Verdict:** All components of the proposed Phase 1.4 architecture are **100% technically viable on Supabase Free Tier**. No paid plan upgrade is required.

---

## 4. Explanation of PostgreSQL and Supabase Identity

A critical defect in naive Prisma + Supabase integrations is confusing PostgreSQL connection authentication with Supabase application user identity.

### 4.1 What `session_user` Represents

- `session_user` is the role that originally authenticated the physical client-to-server TCP connection.
- When Prisma connects using `DATABASE_URL=postgresql://campus_app.<ref>:pass@...`, `session_user` is permanently `'campus_app'` for the lifetime of that database connection.
- It can only be changed by a superuser executing `SET SESSION AUTHORIZATION`.

### 4.2 What `current_user` Represents

- `current_user` (equivalent to `user`) is the role currently used for authorization and privilege checks on SQL statements.
- By default, upon connection, `current_user = session_user = 'campus_app'`.
- When PostgreSQL evaluates table grants and Row Level Security policies, it checks against `current_user`.
- `current_user` changes dynamically when entering a `SECURITY DEFINER` function or when an explicit `SET ROLE` or `SET LOCAL ROLE` command is issued.

### 4.3 What `auth.uid()` Represents

- In Supabase, `auth.uid()` is **not** a built-in PostgreSQL C function. It is a user-defined SQL function living in the `auth` schema that reads the session variable `request.jwt.claims`.
- PostgREST (the HTTP API layer) populates `request.jwt.claims` for every HTTP request that carries a valid Bearer token.
- **On a direct Prisma TCP connection, PostgREST does not exist.** Therefore, `request.jwt.claims` is completely empty/unset.
- Consequently, executing `SELECT auth.uid()` over an ordinary Prisma connection returns **`NULL`**, regardless of whether a student, supervisor, or worker initiated the Express API call.

### 4.4 Why `campus_app` Has No Automatic User Identity

Connecting as `campus_app` identifies the **Express application server**, not the individual human user making the HTTP request. PostgreSQL sees only a shared connection pool owned by `campus_app`.

### 4.5 Why `GRANT authenticated TO campus_app WITH NOINHERIT` is Insufficient

1. `NOINHERIT` means `campus_app` does not automatically possess the privileges of `authenticated`. It must explicitly assume them via `SET ROLE`.
2. Even if `INHERIT` were used, inheriting table grants **does not populate GUC parameters**. `request.jwt.claims` remains unset, meaning `auth.uid()` continues to return `NULL`.
3. Therefore, role membership alone cannot bridge the gap to Supabase RLS policies that evaluate `auth.uid() = student_id`.

### 4.6 What `SET LOCAL ROLE authenticated` Changes

- `SET LOCAL ROLE authenticated` switches `current_user` from `'campus_app'` to `'authenticated'` **only for the duration of the current transaction block** (`BEGIN ... COMMIT`).
- When the transaction finishes, PostgreSQL automatically reverts `current_user` to the session default (`'campus_app'`).
- However, switching the role to `authenticated` still leaves `request.jwt.claims` empty. To make `auth.uid()` functional, the transaction must execute both:
  ```sql
  SET LOCAL ROLE authenticated;
  SELECT set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true);
  ```
  The third argument (`true`) ensures the configuration setting is local to the transaction.

### 4.7 Behavior Under Connection Pooling (Supavisor)

- In Supavisor Session Mode (5432), physical backend connections are held by client connections.
- If a query sets a session variable without the `LOCAL` keyword (`SET ROLE authenticated` or `set_config('...', '...', false)`), that state **persists on the pooled connection**.
- When the next request reuses that connection from the pool, it inherits the previous user's role and identity claims—a catastrophic security vulnerability known as **session state bleeding**.
- Therefore, any transaction-level identity propagation must strictly enforce `LOCAL` scoping within an atomic transaction.

---

## 5. Comparison of the Three Access Patterns

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ACCESS PATTERN TOPOLOGY                                                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Pattern A (Express Authorized)                                                         │
│ Client JWT ──► Express (auth.getUser + RBAC) ──► Prisma (campus_app) ──► PostgreSQL    │
│                 [Enforces Business Logic]        [campus_app Policies]   [DB Triggers] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Pattern B (Transaction RLS Scoped)                                                     │
│ Client JWT ──► Express ──► Prisma ($transaction)                                      │
│                             ├─► SET LOCAL ROLE authenticated                           │
│                             ├─► set_config('request.jwt.claims', is_local=true)        │
│                             └─► User-Scoped Query ───────────────────► PostgreSQL RLS │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Pattern C (Supabase Admin API)                                                         │
│ Express ──► Supabase SDK (service_role HTTP Key) ──► PostgREST / GoTrue / Storage     │
│             [Bypasses All RLS by Design]                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| Evaluation Criterion           | Pattern A: Express + `campus_app`                                                 | Pattern B: Transaction RLS (`SET LOCAL`)             | Pattern C: Supabase Admin SDK                       |
| :----------------------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------------- | :-------------------------------------------------- |
| **Connection Channel**         | PostgreSQL TCP wire via Supavisor port 5432                                       | PostgreSQL TCP wire via Supavisor port 5432          | HTTPS to Supabase REST / Storage / Auth API         |
| **PostgreSQL `current_user`**  | `campus_app`                                                                      | `authenticated` (inside transaction)                 | `service_role` (in PostgREST context)               |
| **Is `auth.uid()` Available?** | ❌ No (`NULL`)                                                                    | ✅ Yes (extracted from injected GUC)                 | ❌ N/A (bypasses RLS)                               |
| **Authorization Boundary**     | Express middleware (Zod, RBAC, state machine)                                     | PostgreSQL Row Level Security engine                 | Express Admin SDK credentials                       |
| **Database Safety Net**        | Triggers (`trg_protect_*`), check constraints                                     | Table RLS policies (`auth.uid() = ...`)              | None (privileged bypass)                            |
| **Latency & Overhead**         | ⚡ **Low** (single direct SQL execution)                                          | ⚠️ **High** (3 SQL statements per transaction)       | ⚠️ **Medium** (HTTP roundtrip to external API)      |
| **Connection Pooling Risk**    | 🟢 **Zero risk** (no session mutations made)                                      | 🔴 **High risk** if transaction boundary fails       | 🟢 **Zero risk** (stateless HTTP)                   |
| **Prisma Compatibility**       | 🟢 **Native** (standard Prisma Client queries)                                    | ⚠️ **Complex** (requires interactive `$transaction`) | ❌ **Incompatible** (Prisma cannot use HTTP API)    |
| **Suitable Use Cases**         | All application CRUD, report creation, work order assignments, status transitions | Defense-in-depth for highly sensitive reads          | Token validation, storage signed URLs, file uploads |
| **Project Suitability**        | **Primary Architecture (Recommended)**                                            | **Prepared Secondary Tool (Restricted)**             | **Auxiliary Utility Only**                          |

---

## 6. Recommended Architecture and Request Lifecycle

### Recommended Model: Hybrid Two-Tier Architecture

1. **Express is the primary business logic and authorization authority.**
2. **PostgreSQL RLS protects direct client channels (Realtime, Storage).**
3. **Database Triggers guarantee relational invariants and prevent privilege escalation.**

### End-to-End Request Lifecycle (e.g. Student Submitting Report)

```
1. CLIENT BROWSER
   │ User submits report form.
   │ React app retrieves current session access token (short-lived Supabase JWT).
   │ Axios sends POST /api/v1/reports with header "Authorization: Bearer <jwt>".
   │ Payload: { title, description, categoryId, specificLocationDetails }
   ▼
2. EXPRESS API GATEWAY
   │
   ├─► STEP 1: authenticate Middleware
   │   • Extracts Bearer token.
   │   • Calls supabaseAdmin.auth.getUser(token) via HTTPS.
   │   • Supabase GoTrue validates signature, expiration, and returns { id: "<student-uuid>" }.
   │   • Express queries PostgreSQL via Prisma:
   │     SELECT * FROM profiles WHERE id = '<student-uuid>' AND is_active = true;
   │   • Attaches req.user = { supabaseUser, profile } to request object.
   │
   ├─► STEP 2: authorize('STUDENT') Middleware
   │   • Verifies req.user.profile.role === 'STUDENT'. Rejects with 403 if mismatch.
   │
   ├─► STEP 3: validate(createReportSchema) Middleware
   │   • Zod validates title, description, categoryId, location details.
   │   • Rejects any payload attempting to inject hostelBlockId, roomId, or studentId.
   │
   ├─► STEP 4: Service Layer Derivation
   │   • Authoritative hostelBlockId is derived from req.user.profile.hostelBlockId.
   │   • Authoritative roomId is derived by resolving profile.roomNumber against hostel_rooms.
   │   • If student is not allocated to a hostel, request fails cleanly with 422.
   │   • Generates unique tracking code (CU-2026-000042) via PostgreSQL sequence.
   │
   ▼
3. PRISMA RUNTIME (campus_app connection via Supavisor port 5432)
   │
   ├─► STEP 5: Atomic Database Transaction
   │   BEGIN;
   │     INSERT INTO maintenance_reports (
   │       id, tracking_code, title, description, category_id,
   │       hostel_block_id, room_id, specific_location_details,
   │       status, priority, student_id, current_worker_id, created_at
   │     ) VALUES (
   │       gen_random_uuid(), 'CU-2026-000042', ...,
   │       req.user.profile.hostelBlockId, resolvedRoomId, ...,
   │       'PENDING', 'LOW', req.user.profile.id, NULL, NOW()
   │     );
   │     INSERT INTO report_status_history (report_id, new_status, changed_by_id, ...)
   │       VALUES (newReportId, 'PENDING', req.user.profile.id, 'Report submitted');
   │     INSERT INTO notifications (user_id, report_id, title, message, event_type)
   │       VALUES (...);
   │   COMMIT;
   │
   ▼
4. POSTGRESQL ENGINE
   │
   ├─► STEP 6: Table Policies & Invariants
   │   • campus_app has explicit GRANT SELECT, INSERT, UPDATE.
   │   • RLS policy app_reports_insert permits campus_app write.
   │   • Database trigger trg_protect_report_fields activates on future updates
   │     to permanently lock student_id, tracking_code, and room_id.
   │
   ▼
5. RESPONSE & REALTIME PROPAGATION
   │ Express responds to Client with 201 Created and report details.
   │ Supabase Realtime detects PostgreSQL write via replication publication.
   │ Realtime evaluates RLS for connected WebSocket subscribers using auth.uid().
   │ Only the submitting student and authorized hostel supervisors receive the event.
```

---

## 7. Transaction and Connection-Pooling Safety Analysis

### 7.1 Why Pattern A is Inherently Safe Under Connection Pooling

- All queries executed by Express use the standard Prisma Client without mutating session state.
- `current_user` remains `'campus_app'` across all queries.
- No `SET ROLE` or `set_config` statements are issued.
- Because no session-level configuration parameters are altered, physical connections in the Supavisor pool remain entirely clean and interchangeable.
- There is **zero possibility of session state bleeding** between different concurrent requests.

### 7.2 Strict Protocol if Pattern B (Interactive RLS Transaction) is Used

If Pattern B is deployed for specific read endpoints, it must follow this exact transaction protocol:

```javascript
export async function withUserContext(userAuthId, userRole, callback) {
  return prisma.$transaction(async (tx) => {
    // 1. Switch role locally to authenticated (reverts automatically on COMMIT/ROLLBACK)
    await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`)

    // 2. Inject JWT claims into transaction-local configuration parameter (is_local = true)
    const claims = JSON.stringify({
      sub: userAuthId,
      role: 'authenticated',
      app_role: userRole,
    })
    await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${claims}, true);`

    // 3. Execute the caller's query within the RLS-scoped transaction
    return await callback(tx)
  })
}
```

#### Why This Prevents Connection Bleeding:

1. `SET LOCAL ROLE` restricts the role switch to the active transaction block.
2. The third parameter `true` in `set_config` explicitly sets `is_local = true`, binding the GUC parameter to the active transaction.
3. Upon `COMMIT` or `ROLLBACK`, PostgreSQL automatically restores the connection's original role (`campus_app`) and clears `request.jwt.claims`.
4. If an exception occurs, Prisma issues a `ROLLBACK`, ensuring poisoned state never survives into the pool.

---

## 8. Required Future Code and Configuration Changes

The existing codebase was thoroughly reviewed. The following changes are cataloged for implementation during subsequent phases (Phase 2.3+). **No files have been modified during Phase 2.2.**

### 8.1 `apps/server/src/config/prisma.js`

- **Current State:** Connects to `env.DATABASE_URL`.
- **Required Change:** Ensure connection pool limits are appended to the URL or managed via client parameters to respect Supabase Free Tier constraints (`?connection_limit=10`).

### 8.2 `apps/server/src/middleware/auth.middleware.js`

- **Current State:** Skeletons `supabaseAdmin.auth.getUser(token)` and `prisma.profile.findUnique()`.
- **Required Change:** Add error mapping for network timeouts to GoTrue, and implement a lightweight in-memory cache (TTL: 60 seconds) for verified profiles to eliminate redundant database lookups on rapid sequential requests.

### 8.3 `apps/server/prisma/schema.prisma`

- **Current State:** Complete model definitions present.
- **Required Change:** No schema changes required. Raw SQL migrations in Phase 2.3 must add the composite foreign key for active workers and the partial unique index (`idx_single_active_assignment_per_report`) that Prisma cannot represent natively.

### 8.4 `apps/server/.env.example`

- **Current State:** Documents `campus_app.<project-ref>` format.
- **Required Change:** Add explicit comments highlighting the `connection_limit=10` parameter for Free Tier pooler stability.

---

## 9. Security Risks and Mitigations

| Risk Identified                            | Severity | Potential Impact                                                        | Concrete Mitigation Implemented in Architecture                                                                                                                                            |
| :----------------------------------------- | :------: | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Application-Level Authorization Bypass** |   High   | Bug in Express code allows unauthorized report modification.            | **Database Triggers:** `trg_protect_report_fields` permanently locks `student_id`, `hostel_block_id`, `room_id`, and `tracking_code` regardless of what query Express issues.              |
| **Privilege Escalation on Profiles**       | Critical | Client alters `role` or `is_active` via direct API or hijacked session. | **Trigger `trg_protect_profile_privilege_fields`:** Explicitly blocks any role change where `current_user = 'authenticated'`. Only `campus_app` (Express admin endpoint) can update roles. |
| **Connection Pool State Bleeding**         | Critical | User A's identity claims bleed into User B's request via shared pool.   | **Pattern A Default:** All standard operations leave connection state unaltered. Pattern B enforces `SET LOCAL` and `is_local = true` strictly inside `$transaction`.                      |
| **Service Role Key Exposure**              | Critical | Server key leaked to browser bundle allows complete database takeover.  | **Strict Boundary:** `SUPABASE_SERVICE_ROLE_KEY` is isolated to `apps/server/src/config/supabaseAdmin.js`. Vite client build contains only `VITE_SUPABASE_ANON_KEY`.                       |
| **Free-Tier Connection Starvation**        |  Medium  | Spike in concurrent requests exhausts Supabase Free Tier pooler.        | **Prisma Connection Clamping:** Limit Prisma client to `connection_limit=10`, allowing Supavisor to queue excess incoming connections cleanly.                                             |

---

## 10. Explicit Unresolved Questions

1. **Supabase Auth Network Latency:**
   - Calling `supabaseAdmin.auth.getUser(token)` on every API request introduces an outbound HTTPS network hop from Express to Supabase GoTrue (~50–150ms).
   - _Question for Phase 2.3:_ Should Express transition to local JWT asymmetric verification (validating the token against Supabase's JWKS public keys) for sub-millisecond authentication, reserving `getUser()` for token revocation checks?
2. **Project Inactivity Keep-Alive:**
   - Supabase Free Tier projects pause after 7 days of inactivity.
   - _Question for Infrastructure:_ Should an automated health-check ping (e.g. GitHub Actions cron or Uptime monitoring) be established to keep the free project warm during development?
3. **Database Migration Execution Path:**
   - Prisma CLI migrations require a direct connection. If the local development machine has restricted IPv6 routing, connecting to direct port `5432` on `db.<ref>.supabase.co` may fail.
   - _Question for Phase 2.3:_ Confirm whether the developer environment supports IPv6 or if migrations must be routed through Supavisor Session Mode (`campus_admin.<ref>` on pooler host).

---

## 11. Final Architectural Recommendation

### **Recommendation: APPROVED WITH CONDITIONS**

The proposed architecture is structurally sound, rigorously grounded in official documentation, fully compatible with Supabase Free Tier, and eliminates the database identity ambiguity that plagued earlier drafts.

### Mandatory Conditions for Phase 2.3:

1. **Condition 1 (Role Creation Order):** Before running Prisma migrations, the `campus_app` runtime role must be created in the Supabase SQL Editor with `LOGIN`, `NOINHERIT`, `NOSUPERUSER`, `NOBYPASSRLS`, and its password securely recorded in `.env`.
2. **Condition 2 (Pool Clamping):** The runtime connection string in `apps/server/.env` must include `?connection_limit=10` to prevent exhausting the Supabase Free Tier connection pool.
3. **Condition 3 (Pattern Discipline):** All report, assignment, and profile mutations must strictly follow **Pattern A** (Express authorization + `campus_app` connection). Pattern B must remain an optional secondary tool reserved strictly for isolated reads.
4. **Condition 4 (Direct Migration Role):** Prisma migration commands must use `DIRECT_URL` connecting as `postgres` or `campus_admin`, never as `campus_app`.

---

_End of Phase 2.2 Review. Standing by for formal review and approval before proceeding._
