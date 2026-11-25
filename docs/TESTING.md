# Testing & quality assurance

## Automated

```bash
npm run test:db   # database workflow, authorization, RLS and notification tests
npm run lint      # ESLint
npm run build     # production build
```

`supabase/tests/workflow.test.mjs` loads `schema.sql` and `seed.sql` into an in-memory Postgres (PGlite) with minimal Supabase `auth` and `storage` stubs. It then checks:

- **Sign-up.** A sign-up that sends `role: ADMIN` in user metadata still becomes a `STUDENT`.
- **Full workflow.** It runs submit → approve → assign → accept → start → progress → complete → return → rework → complete → resolve.
- **Role checks.** Students cannot approve, technicians cannot submit reports, and technicians cannot act on jobs that are not theirs.
- **Input validation.** Short titles, missing rejection reasons and foreign photo paths are rejected.
- **Direct table writes.** Writes to reports are blocked by RLS, and internal helper functions cannot be called.
- **Visibility.** Students only see their own reports, internal notes are hidden from students, and notifications are private.
- **Notifications.** The expected notification is sent for each workflow event.
- **Admin rules.** Admins cannot demote themselves, deactivated users are blocked, and analytics are restricted to staff.
- **Cancellation.** A report cannot be cancelled twice, and only its owner can cancel it.

## Manual QA checklist

Use one test account per role, all on the same Supabase project.

### Authentication & access

- [ ] Student registration, email confirmation, sign in, sign out
- [ ] Forgot password email → reset page → sign in with the new password
- [ ] Supervisor, technician and admin sign in and land on their own dashboard
- [ ] Visiting another role's URL (e.g. student → `/admin`) shows _Access denied_
- [ ] A deactivated user cannot sign in (Edge Function deployed) and loses data access (profile flag)

### Student

- [ ] Report form validation: empty required fields, title under 5 characters, description under 10, more than 5 photos, a non-image file, an image over 5 MB
- [ ] Submission shows the reference number; the supervisor receives a notification
- [ ] My Reports search, status filter and category filter
- [ ] Tracking page timeline, supervisor and technician updates, completion photos and completion date
- [ ] Cancel while pending

### Supervisor

- [ ] Approve with a priority change; reject with a reason (the student sees the reason)
- [ ] Assign with matching specialization; reassign (both technicians see the correct jobs)
- [ ] Internal update hidden from the student
- [ ] Verification: return with feedback (the technician is notified); approve (the student is notified, the report is resolved)
- [ ] Assignment history entries

### Technician

- [ ] Accept → start (the student is notified) → progress update → complete with photos
- [ ] Returned job shows feedback; start rework → resubmit
- [ ] Job history lists completed jobs

### Administrator

- [ ] Register supervisor and technician (with and without an initial password)
- [ ] Edit role and department; set specializations
- [ ] Deactivate and reactivate; send a reset email; set a temporary password
- [ ] Create, edit, deactivate and delete departments, specializations, categories, buildings and locations (deleting an in-use record shows a friendly error)
- [ ] Analytics date and department filters; CSV exports open in a spreadsheet; print to PDF

### Notifications

- [ ] Bell badge updates in real time; mark read, mark unread, mark all read; delete

### Cross-cutting

- [ ] Mobile widths (360 px, 768 px): sidebar drawer, tables scroll, modals as bottom sheets, camera capture on the photo picker
- [ ] Image uploads display through signed URLs; a user without access cannot open the photos
- [ ] Network or permission errors show readable messages (toasts and error states with retry)
- [ ] End-to-end: run student → supervisor → technician → supervisor → student in separate browsers

## Deployed application smoke test

1. Open the production URL; the sign-in page loads with no "Supabase is not configured" banner.
2. Register a student and confirm the email (check that the redirect URL points at the production domain).
3. Run the end-to-end workflow above with production staff accounts.
4. Confirm that the password-reset email links point to `/reset-password` on the production domain.
