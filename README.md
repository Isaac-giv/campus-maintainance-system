# Cosmopolitan University Campus Maintenance Reporting and Tracking System

<div align="center">

![Project Status: Completed](https://img.shields.io/badge/Status-COMPLETED-emerald?style=for-the-badge&logo=checkmarx&logoColor=white)
![Build: Passing](https://img.shields.io/badge/Build-PASSING-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)
![UI Mockup: 100%](https://img.shields.io/badge/UI%20Mockup-100%25%20Fidelity-blue?style=for-the-badge)
![Institution: Cosmopolitan University](https://img.shields.io/badge/Cosmopolitan%20University-To%20The%20Summit-1e2a4a?style=for-the-badge)

</div>

A full-stack, enterprise-grade maintenance management system designed for **Cosmopolitan University** to streamline hostel issue reporting, triage, work order assignment, resolution tracking, photo verification, and audit logging.

---

## 📋 Project Status: ✅ COMPLETED

| Phase / Milestone                            | Deliverable                                                                                      | Status           |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------- | :--------------- |
| **Phase 1: Architecture & Security**         | Architectural blueprint, Supabase Free-Tier RLS validation & database identity design            | ✅ **Completed** |
| **Phase 2.1: Monorepo Initialization**       | Modular monorepo setup (npm workspaces, ES Modules, ESLint, Prettier, Prisma schema)             | ✅ **Completed** |
| **Phase 2.2: UI Mockup Implementation**      | 100% fidelity to reference mockups across all 5 screens with Cosmopolitan University branding    | ✅ **Completed** |
| **Phase 2.3: Role-Based Access Control**     | Dedicated role portals & route guards for Student, Supervisor, Technician (Worker), and Admin    | ✅ **Completed** |
| **Phase 2.4: Verification Gate System**      | Mandatory identity & residency verification required before dashboard access (`/verify-account`) | ✅ **Completed** |
| **Phase 2.5: Student Registry & Seed Data**  | Extended student database across Hostel Blocks A–D + Public self-registration (`/register`)      | ✅ **Completed** |
| **Phase 2.6: Production Build & Git Remote** | Linting (0 errors), formatting verified, and repository deployed to GitHub                       | ✅ **Completed** |

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

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router 7, TanStack Query 5, Lucide React
- **Backend:** Node.js 24, Express 5, Prisma ORM 6
- **Database & Auth:** Supabase PostgreSQL (Free tier), Supabase Auth, Supabase Storage, Supabase Realtime
- **Database Connection:** Supavisor Session Pooler (port 5432) using dedicated `campus_app` role
- **Validation:** Zod 3 (shared between frontend & backend)

---

## 🎯 Role Dashboards & Features

- **👩‍🎓 Student Dashboard (`/student`):**
  - Personalized welcome banner (_"Hello, Chinwe! 👋"_).
  - Hostel maintenance status indicator.
  - 4 Metric cards: _Total Reports, In Progress, Resolved, Pending_.
  - Quick report action banner + live photo upload dropzone with real-time preview card (`/student/reports/new`).
  - Searchable reports table with status pills and resolution timeline (`/student/reports`).

- **👨‍💼 Supervisor Dashboard (`/supervisor`):**
  - Hostel Blocks A & B maintenance oversight.
  - Real-time technician availability roster.
  - Urgent triage queue with one-click technician dispatch modal (`/supervisor/triage`).
  - Photo evidence inspection & sign-off queue (`/supervisor/verify`).

- **🔧 Technician Command Center (`/worker`):**
  - Active duty toggle: `[🟢 ON ACTIVE DUTY / ⚪ OFF DUTY]`.
  - Daily repair KPI summary (Assigned, In Progress, Pending Sign-off, Completed).
  - Urgent priority repair list with immediate job start and execution actions (`/worker/jobs/:id`).
  - Technician daily route schedule & safety tool checklist.

- **👑 Administrator Dashboard (`/admin`):**
  - Campus-wide facilities executive oversight.
  - Headline metrics (48 Total, 32 Resolved, 14 In Progress, 2 Pending).
  - Circular distribution chart (67% Resolved, 29% In Progress, 4% Pending).
  - User Directory with role management & 1-click verification approval (`/admin/users`).
  - Student onboarding modal (`+ Add New Student`).

- **🔐 Mandatory Identity Verification (`/verify-account`):**
  - Blocks unverified users from viewing dashboards or filing tickets until identity is confirmed.
  - Interactive 6-digit PIN verification code (demo test code: `123456`).
  - 1-click instant administrator bypass approval button.

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

## 🏛️ Institution

**Cosmopolitan University**  
_Motto: "To The Summit"_  
&copy; 2026 Cosmopolitan University. All rights reserved.
