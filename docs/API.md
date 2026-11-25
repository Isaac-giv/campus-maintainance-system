# API reference

The backend API consists of Postgres RPC functions (called with `supabase.rpc(name, args)` or `POST /rest/v1/rpc/<name>`), RLS-protected table reads, and one Edge Function. The client wrapper for all of them is [`apps/client/src/services/api.js`](../apps/client/src/services/api.js).

All functions require an authenticated, active user. Errors are raised with these SQLSTATE codes:

| Code    | Meaning                                                                  |
| ------- | ------------------------------------------------------------------------ |
| `28000` | Not signed in                                                            |
| `42501` | Not authorized / inactive account / not your job                         |
| `22023` | Validation error or invalid status transition (message is user-friendly) |
| `P0002` | Not found                                                                |
| `54000` | Rate limit (more than 10 reports per hour)                               |

## Profile

| Function            | Roles | Arguments                                                                                                                                                           |
| ------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update_my_profile` | All   | `p_full_name`, `p_phone`, `p_avatar_url`, `p_programme`, `p_level`, `p_building_id`, `p_room_number`, `p_matric_number` (set once), `p_job_title`, `p_is_available` |

## Student

| Function        | Arguments                                                                                                                                                                  | Effect                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `submit_report` | `p_title` (5–150), `p_description` (10–2000), `p_category_id`, `p_building_id`, `p_location_details` (1–300), `p_location_id?`, `p_photo_paths?` (≤5, must be in `<uid>/`) | Creates report with reference number `CMR-YYYY-NNNNN`, status `PENDING`; returns the report row |
| `cancel_report` | `p_report_id`, `p_reason?`                                                                                                                                                 | Own report, only while `PENDING`/`APPROVED`                                                     |

## Supervisor (and Admin)

| Function               | Arguments                                                                                         | Effect                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `review_report`        | `p_report_id`, `p_approve`, `p_reason` (required when rejecting), `p_priority?`, `p_category_id?` | → `APPROVED` or `REJECTED`                                                                                                                                  |
| `triage_report`        | `p_report_id`, `p_priority?`, `p_category_id?`                                                    | Categorise/prioritise an open report                                                                                                                        |
| `assign_technician`    | `p_report_id`, `p_technician_id`, `p_instructions?`, `p_priority?`                                | Assign or reassign; closes the previous assignment; → `ASSIGNED`                                                                                            |
| `verify_completion`    | `p_report_id`, `p_approve`, `p_feedback` (required when returning)                                | → `RESOLVED` (sets `resolved_at`) or `RETURNED`                                                                                                             |
| `update_report_status` | `p_report_id`, `p_status`, `p_note?`                                                              | Generic transition validated by the state machine                                                                                                           |
| `add_report_update`    | `p_report_id`, `p_message`, `p_internal?`                                                         | Comment on a report                                                                                                                                         |
| `report_analytics`     | `p_from?`, `p_to?` (dates), `p_department_id?`                                                    | Returns JSON: totals, by status/priority/category/department/building, monthly trend, resolution rate, average resolution hours, per-technician performance |

## Technician

| Function            | Arguments                                            | Effect                                       |
| ------------------- | ---------------------------------------------------- | -------------------------------------------- |
| `accept_job`        | `p_report_id`                                        | `ASSIGNED` → `ACCEPTED`                      |
| `start_job`         | `p_report_id`                                        | `ASSIGNED/ACCEPTED/RETURNED` → `IN_PROGRESS` |
| `add_report_update` | `p_report_id`, `p_message`, `p_internal?`            | Records work progress (own jobs only)        |
| `submit_completion` | `p_report_id`, `p_notes` (10–2000), `p_photo_paths?` | → `AWAITING_VERIFICATION`                    |

## Notifications

| Function                      | Arguments                       |
| ----------------------------- | ------------------------------- |
| `mark_notification_read`      | `p_id`, `p_read` (default true) |
| `mark_all_notifications_read` | —                               |

Delete: `delete from notifications where id = …` (own rows only, via RLS).

## Administrator

| Function                    | Arguments                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `admin_update_user`         | `p_user_id`, `p_full_name`, `p_role`, `p_department_id?`, `p_phone?`, `p_is_active`, `p_staff_number?`, `p_job_title?`, `p_matric_number?`, `p_building_id?`, `p_room_number?` |
| `admin_set_user_active`     | `p_user_id`, `p_active`                                                                                                                                                        |
| `admin_set_specializations` | `p_technician_id`, `p_specialization_ids uuid[]`                                                                                                                               |
| `admin_assign_department`   | `p_user_ids uuid[]`, `p_department_id`                                                                                                                                         |

Reference data (`departments`, `specializations`, `buildings`, `locations`, `maintenance_categories`) is managed with ordinary insert/update/delete calls; RLS restricts writes to admins and a trigger records each change in `activity_log`.

## Edge Function `admin-users`

`POST /functions/v1/admin-users` with the admin's JWT. Body:

| `action`         | Fields                                                                                                                                                         | Effect                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `create`         | `email`, `fullName`, `role`, `password?`, `departmentId?`, `phone?`, `staffNumber?`, `jobTitle?`, `matricNumber?`, `buildingId?`, `roomNumber?`, `redirectTo?` | Creates a confirmed auth user with the role in `app_metadata`. Without a password, emails a set-password link |
| `reset_password` | `userId`, `redirectTo?`                                                                                                                                        | Sends a password-reset email                                                                                  |
| `set_password`   | `userId`, `password`                                                                                                                                           | Sets a temporary password                                                                                     |
| `set_active`     | `userId`, `active`                                                                                                                                             | Bans/unbans in Auth and updates `profiles.is_active`                                                          |

## Storage

| Bucket          | Visibility                 | Path                          | Limits              |
| --------------- | -------------------------- | ----------------------------- | ------------------- |
| `report-photos` | Private, signed URLs (1 h) | `<uploader-uid>/<uuid>.<ext>` | 5 MB, JPEG/PNG/WEBP |
| `avatars`       | Public                     | `<uid>/avatar-<ts>.<ext>`     | 2 MB                |
