# Cosmopolitan University Campus Maintenance Reporting and Tracking System

A full-stack, enterprise-grade maintenance management system designed for Cosmopolitan University to streamline hostel issue reporting, triage, work order assignment, resolution tracking, and audit logging.

---

## 🏛️ Architecture Overview

The system is organized as a clean **modular monorepo** using **npm workspaces** and **JavaScript ES Modules** throughout (no TypeScript).

```
campus-maintenance-system/
├── apps/
│   ├── client/               # React + Vite + Tailwind CSS frontend
│   └── server/               # Node.js + Express 5 REST API
├── packages/
│   └── shared/               # Shared constants, enums, and Zod validation schemas
├── package.json              # npm workspaces root definition
└── .gitignore
```

### Technology Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router 7, TanStack Query 5
- **Backend:** Node.js 24, Express 5, Prisma ORM 6
- **Database & Auth:** Supabase PostgreSQL (Free tier), Supabase Auth, Supabase Storage, Supabase Realtime
- **Database Connection:** Supavisor Session Pooler (port 5432) using dedicated `campus_app` role
- **Validation:** Zod 3 (shared between frontend & backend)

---

## 🔐 Security & Access Architecture (Phase 1.4)

1. **Authentication:** Supabase Auth issues short-lived JWT access tokens. Client attaches tokens as `Authorization: Bearer <token>`.
2. **Four Distinct Roles:** `STUDENT`, `SUPERVISOR`, `WORKER`, `ADMIN`.
3. **Database Roles:**
   - `campus_app`: Non-superuser, `NOBYPASSRLS` runtime role used by Express/Prisma.
   - `campus_admin`: Dedicated migration role used exclusively by Prisma CLI (`prisma migrate`).
4. **Enforcement Boundaries:** Express RBAC is the primary business logic boundary; PostgreSQL Row Level Security (RLS) protects direct Supabase access (Storage, Realtime, PostgREST).
5. **No Password Storage in Application DB:** Credentials reside strictly in `auth.users`. Application profiles only mirror the identity.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0 (v24 recommended)
- **npm** >= 10.0.0
- **Git**

### Installation

From the root directory:

```bash
npm install
```

### Environment Configuration

1. **Server environment:**
   Copy `apps/server/.env.example` to `apps/server/.env` and provide your Supabase connection strings:
   - `DATABASE_URL`: Connection string via Supavisor session pooler (username format: `campus_app.<project-ref>`)
   - `DIRECT_URL`: Direct PostgreSQL connection string for migrations
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (server-side only)

2. **Client environment:**
   Copy `apps/client/.env.example` to `apps/client/.env.local`:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Public anonymous API key
   - `VITE_API_BASE_URL`: Express API endpoint (`http://localhost:3001/api/v1` in dev)

---

## 🛠️ Development Scripts

Run scripts from the repository root:

- **Start Client:**
  ```bash
  npm run dev:client
  ```
- **Start Express Server:**
  ```bash
  npm run dev:server
  ```
- **Lint All Workspaces:**
  ```bash
  npm run lint
  ```
- **Check Code Formatting:**
  ```bash
  npm run format:check
  ```
- **Apply Code Formatting:**
  ```bash
  npm run format
  ```
- **Build Client for Production:**
  ```bash
  npm run build
  ```

---

## 📋 Project Status

- **Phase 1 (Complete):** Architecture specification & blueprint approval (Phase 1.4).
- **Phase 2.1 (Complete):** Project Initialization, folder structure, npm workspaces, linting, shared library, route stubs, client scaffold, and Prisma schema.
- **Phase 2.2 (Pending approval):** Supabase Auth & Profile Synchronization integration.
