-- ==============================================================================
-- Cosmopolitan University - Campus Maintenance Reporting & Tracking System
-- Supabase schema: tables, helper functions, RPC API, RLS, storage, notifications
-- ==============================================================================
-- Run this whole script in Supabase Dashboard -> SQL Editor on a FRESH project.
-- Then run supabase/seed.sql for reference data.
--
-- Architecture:
--   * The React client talks to Supabase directly (supabase-js).
--   * Reference data (departments, buildings, locations, categories,
--     specializations) is read by any signed-in user and written by admins
--     through RLS-protected table access.
--   * Every workflow change to a maintenance report goes through a
--     SECURITY DEFINER RPC function (section 6). The functions validate input,
--     enforce role/ownership authorization and the status state machine,
--     write status history, and trigger notifications. Clients have NO direct
--     INSERT/UPDATE rights on reports, assignments or history tables.
--   * Privileged auth operations (create user, reset password, ban) live in
--     the `admin-users` Edge Function (supabase/functions/admin-users).
-- ==============================================================================

-- - 1. ENUM-LIKE DOMAINS -

do $$ begin
  create type public.user_role as enum ('STUDENT', 'SUPERVISOR', 'TECHNICIAN', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum (
    'PENDING',               -- submitted by student, awaiting supervisor review
    'APPROVED',              -- reviewed and accepted as valid, awaiting assignment
    'REJECTED',              -- reviewed and rejected as invalid (terminal)
    'ASSIGNED',              -- assigned to a technician
    'ACCEPTED',              -- technician accepted the job
    'IN_PROGRESS',           -- maintenance work started
    'AWAITING_VERIFICATION', -- technician submitted completion
    'RETURNED',              -- supervisor returned unsatisfactory work
    'RESOLVED',              -- supervisor verified the work (terminal)
    'CANCELLED'              -- student withdrew the complaint (terminal)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
exception when duplicate_object then null; end $$;

-- - 2. REFERENCE TABLES -

create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(trim(name)) between 2 and 100),
  code        text unique,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.specializations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique check (char_length(trim(name)) between 2 and 100),
  description   text,
  department_id uuid references public.departments(id) on delete set null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.buildings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(trim(name)) between 2 and 120),
  code        text unique,
  type        text not null default 'ACADEMIC'
              check (type in ('ACADEMIC', 'HOSTEL', 'ADMINISTRATIVE', 'SPORTS', 'OTHER')),
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  name        text not null check (char_length(trim(name)) between 1 and 120),
  type        text not null default 'ROOM' check (type in ('ROOM', 'FACILITY', 'AREA')),
  floor       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (building_id, name)
);

create table if not exists public.maintenance_categories (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique check (char_length(trim(name)) between 2 and 100),
  description       text,
  icon              text not null default 'Wrench',
  department_id     uuid references public.departments(id) on delete set null,
  specialization_id uuid references public.specializations(id) on delete set null,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- - 3. USERS & PROFILES -

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  phone         text,
  avatar_url    text,
  role          public.user_role not null default 'STUDENT',
  department_id uuid references public.departments(id) on delete set null,
  is_active     boolean not null default true,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);

create table if not exists public.student_profiles (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  matric_number  text unique,
  programme      text,
  level          text,
  building_id    uuid references public.buildings(id) on delete set null,
  room_number    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.staff_profiles (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  staff_number text unique,
  job_title    text,
  is_available boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.technician_specializations (
  technician_id     uuid not null references public.profiles(id) on delete cascade,
  specialization_id uuid not null references public.specializations(id) on delete cascade,
  primary key (technician_id, specialization_id)
);

-- - 4. MAINTENANCE WORKFLOW TABLES -

create sequence if not exists public.report_reference_seq start 1001;

create table if not exists public.maintenance_reports (
  id                    uuid primary key default gen_random_uuid(),
  reference_number      text not null unique,
  title                 text not null check (char_length(title) between 5 and 150),
  description           text not null check (char_length(description) between 10 and 2000),
  category_id           uuid not null references public.maintenance_categories(id),
  building_id           uuid not null references public.buildings(id),
  location_id           uuid references public.locations(id) on delete set null,
  location_details      text not null check (char_length(location_details) between 1 and 300),
  status                public.report_status not null default 'PENDING',
  priority              public.report_priority not null default 'MEDIUM',
  student_id            uuid not null references public.profiles(id) on delete cascade,
  current_technician_id uuid references public.profiles(id) on delete set null,
  reviewed_by           uuid references public.profiles(id) on delete set null,
  reviewed_at           timestamptz,
  rejection_reason      text,
  completion_notes      text,
  started_at            timestamptz,
  completed_at          timestamptz,   -- technician submitted for verification
  verified_by           uuid references public.profiles(id) on delete set null,
  resolved_at           timestamptz,   -- supervisor verified (completion date)
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists reports_student_idx on public.maintenance_reports(student_id);
create index if not exists reports_tech_idx on public.maintenance_reports(current_technician_id);
create index if not exists reports_status_idx on public.maintenance_reports(status);
create index if not exists reports_created_idx on public.maintenance_reports(created_at desc);

create table if not exists public.report_photos (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid not null references public.maintenance_reports(id) on delete cascade,
  stage        text not null check (stage in ('REPORT', 'COMPLETION')),
  storage_path text not null unique,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists report_photos_report_idx on public.report_photos(report_id);

create table if not exists public.technician_assignments (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.maintenance_reports(id) on delete cascade,
  technician_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by   uuid references public.profiles(id) on delete set null,
  instructions  text,
  status        text not null default 'ACTIVE' check (status in ('ACTIVE', 'REASSIGNED', 'COMPLETED')),
  assigned_at   timestamptz not null default now(),
  accepted_at   timestamptz,
  ended_at      timestamptz
);
create index if not exists assignments_report_idx on public.technician_assignments(report_id);
create index if not exists assignments_tech_idx on public.technician_assignments(technician_id);

create table if not exists public.status_history (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.maintenance_reports(id) on delete cascade,
  from_status public.report_status,
  to_status   public.report_status not null,
  changed_by  uuid references public.profiles(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists status_history_report_idx on public.status_history(report_id, created_at);

create table if not exists public.report_updates (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.maintenance_reports(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  author_role public.user_role,
  type        text not null default 'COMMENT'
              check (type in ('COMMENT', 'PROGRESS', 'REVIEW', 'FEEDBACK', 'RESOLUTION', 'ASSIGNMENT')),
  message     text not null check (char_length(message) between 1 and 2000),
  is_internal boolean not null default false,  -- staff-only notes hidden from students
  created_at  timestamptz not null default now()
);
create index if not exists report_updates_report_idx on public.report_updates(report_id, created_at);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  report_id  uuid references public.maintenance_reports(id) on delete cascade,
  type       text not null,
  title      text not null,
  message    text not null,
  is_read    boolean not null default false,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists activity_log_created_idx on public.activity_log(created_at desc);

-- updated_at maintenance
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['departments','buildings','maintenance_categories','profiles',
                           'student_profiles','staff_profiles','maintenance_reports']
  loop
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$s', t);
    execute format('create trigger trg_touch_%1$s before update on public.%1$s
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- - 5. AUTH HELPERS -

-- Role of the signed-in user; NULL when signed out or deactivated.
create or replace function public.current_user_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'ADMIN', false)
$$;

create or replace function public.is_supervisor_or_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('SUPERVISOR', 'ADMIN'), false)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('SUPERVISOR', 'TECHNICIAN', 'ADMIN'), false)
$$;

-- Can the signed-in user view a given report?
create or replace function public.can_view_report(p_report_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.maintenance_reports r
    where r.id = p_report_id
      and public.current_user_role() is not null
      and (
        public.is_supervisor_or_admin()
        or r.student_id = auth.uid()
        or r.current_technician_id = auth.uid()
        or exists (select 1 from public.technician_assignments a
                   where a.report_id = r.id and a.technician_id = auth.uid())
      )
  )
$$;

-- Raise a consistent, client-friendly error.
create or replace function public._fail(p_message text, p_code text default 'P0001') returns void
language plpgsql as $$
begin
  raise exception using message = p_message, errcode = p_code;
end $$;

create or replace function public._require_role(p_roles public.user_role[]) returns public.user_role
language plpgsql stable security definer set search_path = public as $$
declare v_role public.user_role := public.current_user_role();
begin
  if auth.uid() is null then
    perform public._fail('You must be signed in.', '28000');
  end if;
  if v_role is null then
    perform public._fail('Your account is inactive. Contact the administrator.', '42501');
  end if;
  if not (v_role = any(p_roles)) then
    perform public._fail('You are not authorized to perform this action.', '42501');
  end if;
  return v_role;
end $$;

-- - 5b. NEW USER -> PROFILE -
-- Public sign-ups always become STUDENT. A different role can only be set through
-- app_metadata, which only the service role (admin-users Edge Function) can write.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role := 'STUDENT';
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_building uuid;
begin
  if (new.raw_app_meta_data ->> 'role') in ('STUDENT', 'SUPERVISOR', 'TECHNICIAN', 'ADMIN') then
    v_role := (new.raw_app_meta_data ->> 'role')::public.user_role;
  end if;

  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email,
          coalesce(nullif(trim(v_meta ->> 'full_name'), ''), split_part(new.email, '@', 1)),
          nullif(trim(v_meta ->> 'phone'), ''),
          v_role)
  on conflict (id) do nothing;

  if v_role = 'STUDENT' then
    begin
      v_building := nullif(v_meta ->> 'building_id', '')::uuid;
    exception when others then v_building := null;
    end;
    insert into public.student_profiles (user_id, matric_number, programme, level, building_id, room_number)
    values (new.id,
            nullif(upper(trim(v_meta ->> 'matric_number')), ''),
            nullif(trim(v_meta ->> 'programme'), ''),
            nullif(trim(v_meta ->> 'level'), ''),
            (select id from public.buildings where id = v_building),
            nullif(trim(v_meta ->> 'room_number'), ''))
    on conflict (user_id) do nothing;
  else
    insert into public.staff_profiles (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- - 5c. NOTIFICATIONS & HISTORY HELPERS -

create or replace function public._notify(p_user uuid, p_report uuid, p_type text, p_title text, p_message text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into public.notifications (user_id, report_id, type, title, message)
  values (p_user, p_report, p_type, p_title, p_message);
end $$;

-- Supervisors responsible for a report: those in the category's department,
-- plus supervisors without a department (campus-wide). Falls back to all supervisors.
create or replace function public._report_supervisors(p_report uuid) returns setof uuid
language sql stable security definer set search_path = public as $$
  with dept as (
    select c.department_id from public.maintenance_reports r
    join public.maintenance_categories c on c.id = r.category_id where r.id = p_report
  ), matched as (
    select p.id from public.profiles p, dept
    where p.role = 'SUPERVISOR' and p.is_active
      and (p.department_id is null or dept.department_id is null or p.department_id = dept.department_id)
  )
  select id from matched
  union
  select p.id from public.profiles p
  where p.role = 'SUPERVISOR' and p.is_active and not exists (select 1 from matched)
$$;

create or replace function public._log_activity(p_action text, p_entity text, p_entity_id uuid, p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), p_action, p_entity, p_entity_id, coalesce(p_details, '{}'::jsonb));
end $$;

-- Central notification dispatcher, fired for every status history row.
create or replace function public.notify_on_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r public.maintenance_reports;
  v_sup uuid;
  v_ref text;
begin
  select * into r from public.maintenance_reports where id = new.report_id;
  v_ref := r.reference_number;

  case new.to_status
    when 'PENDING' then
      if new.from_status is null then
        perform public._notify(r.student_id, r.id, 'REPORT_SUBMITTED', 'Complaint submitted',
          format('Your complaint %s "%s" was submitted successfully.', v_ref, r.title));
        for v_sup in select * from public._report_supervisors(r.id) loop
          perform public._notify(v_sup, r.id, 'NEW_COMPLAINT', 'New complaint received',
            format('%s: "%s" needs review.', v_ref, r.title));
        end loop;
      end if;
    when 'APPROVED' then
      perform public._notify(r.student_id, r.id, 'REPORT_REVIEWED', 'Complaint approved',
        format('Your complaint %s was reviewed and approved.', v_ref));
    when 'REJECTED' then
      perform public._notify(r.student_id, r.id, 'REPORT_REVIEWED', 'Complaint rejected',
        format('Your complaint %s was rejected: %s', v_ref, coalesce(r.rejection_reason, 'no reason given')));
    when 'ASSIGNED' then
      perform public._notify(r.current_technician_id, r.id, 'NEW_ASSIGNMENT', 'New job assigned',
        format('%s: "%s" has been assigned to you.', v_ref, r.title));
      if new.from_status in ('PENDING', 'APPROVED') then
        perform public._notify(r.student_id, r.id, 'REPORT_ASSIGNED', 'Technician assigned',
          format('A technician has been assigned to your complaint %s.', v_ref));
      end if;
    when 'IN_PROGRESS' then
      if new.from_status in ('ASSIGNED', 'ACCEPTED') then
        perform public._notify(r.student_id, r.id, 'WORK_STARTED', 'Work has begun',
          format('Maintenance work on %s has started.', v_ref));
      end if;
    when 'AWAITING_VERIFICATION' then
      perform public._notify(r.student_id, r.id, 'WORK_COMPLETED', 'Work completed',
        format('The technician has completed work on %s. It is awaiting supervisor verification.', v_ref));
      if r.reviewed_by is not null then
        perform public._notify(r.reviewed_by, r.id, 'AWAITING_VERIFICATION', 'Job awaiting verification',
          format('%s: "%s" is ready for verification.', v_ref, r.title));
      else
        for v_sup in select * from public._report_supervisors(r.id) loop
          perform public._notify(v_sup, r.id, 'AWAITING_VERIFICATION', 'Job awaiting verification',
            format('%s: "%s" is ready for verification.', v_ref, r.title));
        end loop;
      end if;
    when 'RETURNED' then
      perform public._notify(r.current_technician_id, r.id, 'WORK_RETURNED', 'Work returned for correction',
        format('%s was returned: %s', v_ref, coalesce(new.note, 'see supervisor feedback')));
    when 'RESOLVED' then
      perform public._notify(r.student_id, r.id, 'REPORT_RESOLVED', 'Complaint resolved',
        format('Your complaint %s has been verified and resolved.', v_ref));
    when 'CANCELLED' then
      if r.current_technician_id is not null then
        perform public._notify(r.current_technician_id, r.id, 'REPORT_CANCELLED', 'Job cancelled',
          format('%s was cancelled.', v_ref));
      end if;
    else null;
  end case;
  return new;
end $$;

drop trigger if exists trg_notify_status on public.status_history;
create trigger trg_notify_status after insert on public.status_history
  for each row execute function public.notify_on_status_change();

-- Valid state machine transitions (from -> to).
create or replace function public._is_valid_transition(p_from public.report_status, p_to public.report_status)
returns boolean language sql immutable as $$
  select (p_from, p_to) in (
    ('PENDING','APPROVED'), ('PENDING','REJECTED'), ('PENDING','CANCELLED'), ('PENDING','ASSIGNED'),
    ('APPROVED','ASSIGNED'), ('APPROVED','REJECTED'), ('APPROVED','CANCELLED'),
    ('ASSIGNED','ASSIGNED'), ('ASSIGNED','ACCEPTED'), ('ASSIGNED','IN_PROGRESS'),
    ('ACCEPTED','ASSIGNED'), ('ACCEPTED','IN_PROGRESS'),
    ('IN_PROGRESS','ASSIGNED'), ('IN_PROGRESS','AWAITING_VERIFICATION'),
    ('AWAITING_VERIFICATION','RESOLVED'), ('AWAITING_VERIFICATION','RETURNED'),
    ('RETURNED','IN_PROGRESS'), ('RETURNED','ASSIGNED')
  )
$$;

-- Apply a status change with validation + history. Caller has already authorized.
create or replace function public._transition(p_report uuid, p_to public.report_status, p_note text default null)
returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare
  r public.maintenance_reports;
  v_from public.report_status;
begin
  select * into r from public.maintenance_reports where id = p_report for update;
  if not found then perform public._fail('Report not found.', 'P0002'); end if;
  v_from := r.status;
  if not public._is_valid_transition(v_from, p_to) then
    perform public._fail(format('Cannot change status from %s to %s.', v_from, p_to), '22023');
  end if;
  update public.maintenance_reports set status = p_to where id = p_report returning * into r;
  insert into public.status_history (report_id, from_status, to_status, changed_by, note)
  values (p_report, v_from, p_to, auth.uid(), nullif(trim(p_note), ''));
  return r;
end $$;

create or replace function public._add_update(p_report uuid, p_type text, p_message text, p_internal boolean default false)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_message is null or trim(p_message) = '' then return; end if;
  insert into public.report_updates (report_id, author_id, author_role, type, message, is_internal)
  values (p_report, auth.uid(), public.current_user_role(), p_type, trim(p_message), p_internal);
end $$;

-- Validate storage paths belong to the caller's upload folder.
create or replace function public._attach_photos(p_report uuid, p_stage text, p_paths text[])
returns void language plpgsql security definer set search_path = public as $$
declare v_path text;
begin
  if p_paths is null then return; end if;
  if array_length(p_paths, 1) > 5 then
    perform public._fail('A maximum of 5 photographs can be attached.', '22023');
  end if;
  foreach v_path in array p_paths loop
    if split_part(v_path, '/', 1) <> auth.uid()::text then
      perform public._fail('Invalid photograph path.', '22023');
    end if;
    insert into public.report_photos (report_id, stage, storage_path, uploaded_by)
    values (p_report, p_stage, v_path, auth.uid());
  end loop;
end $$;

-- - 6. RPC API -

-- 6.1 Profile ------------------------------------------------------------------

create or replace function public.update_my_profile(
  p_full_name text, p_phone text default null, p_avatar_url text default null,
  p_programme text default null, p_level text default null,
  p_building_id uuid default null, p_room_number text default null,
  p_matric_number text default null, p_job_title text default null, p_is_available boolean default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_role public.user_role := public._require_role(array['STUDENT','SUPERVISOR','TECHNICIAN','ADMIN']::public.user_role[]);
begin
  if p_full_name is null or char_length(trim(p_full_name)) < 2 or char_length(trim(p_full_name)) > 100 then
    perform public._fail('Full name must be between 2 and 100 characters.', '22023');
  end if;
  if p_phone is not null and trim(p_phone) <> '' and trim(p_phone) !~ '^\+?[0-9\s\-()]{7,20}$' then
    perform public._fail('Invalid phone number format.', '22023');
  end if;
  update public.profiles
     set full_name = trim(p_full_name), phone = nullif(trim(p_phone), ''),
         avatar_url = coalesce(p_avatar_url, avatar_url)
   where id = auth.uid();

  if v_role = 'STUDENT' then
    insert into public.student_profiles (user_id) values (auth.uid()) on conflict do nothing;
    update public.student_profiles
       set programme = nullif(trim(p_programme), ''), level = nullif(trim(p_level), ''),
           building_id = p_building_id, room_number = nullif(trim(p_room_number), ''),
           matric_number = coalesce(matric_number, nullif(upper(trim(p_matric_number)), ''))
     where user_id = auth.uid();
  else
    insert into public.staff_profiles (user_id) values (auth.uid()) on conflict do nothing;
    update public.staff_profiles
       set job_title = coalesce(nullif(trim(p_job_title), ''), job_title),
           is_available = coalesce(p_is_available, is_available)
     where user_id = auth.uid();
  end if;
end $$;

-- 6.2 Student --------------------------------------------------------------------

create or replace function public.submit_report(
  p_title text, p_description text, p_category_id uuid, p_building_id uuid,
  p_location_details text, p_location_id uuid default null, p_photo_paths text[] default null
) returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare
  r public.maintenance_reports;
  v_ref text;
begin
  perform public._require_role(array['STUDENT']::public.user_role[]);

  if p_title is null or char_length(trim(p_title)) < 5 or char_length(trim(p_title)) > 150 then
    perform public._fail('Title must be between 5 and 150 characters.', '22023');
  end if;
  if p_description is null or char_length(trim(p_description)) < 10 or char_length(trim(p_description)) > 2000 then
    perform public._fail('Description must be between 10 and 2000 characters.', '22023');
  end if;
  if p_location_details is null or char_length(trim(p_location_details)) < 1 or char_length(trim(p_location_details)) > 300 then
    perform public._fail('Please enter the room or specific location (max 300 characters).', '22023');
  end if;
  if not exists (select 1 from public.maintenance_categories where id = p_category_id and is_active) then
    perform public._fail('Please select a valid maintenance category.', '22023');
  end if;
  if not exists (select 1 from public.buildings where id = p_building_id and is_active) then
    perform public._fail('Please select a valid building.', '22023');
  end if;
  if p_location_id is not null and not exists (
      select 1 from public.locations where id = p_location_id and building_id = p_building_id and is_active) then
    perform public._fail('The selected location does not belong to the selected building.', '22023');
  end if;
  -- Basic abuse protection: max 10 reports per student per hour.
  if (select count(*) from public.maintenance_reports
      where student_id = auth.uid() and created_at > now() - interval '1 hour') >= 10 then
    perform public._fail('Too many reports submitted. Please try again later.', '54000');
  end if;

  v_ref := 'CMR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.report_reference_seq')::text, 5, '0');

  insert into public.maintenance_reports
    (reference_number, title, description, category_id, building_id, location_id, location_details, student_id)
  values (v_ref, trim(p_title), trim(p_description), p_category_id, p_building_id, p_location_id,
          trim(p_location_details), auth.uid())
  returning * into r;

  perform public._attach_photos(r.id, 'REPORT', p_photo_paths);

  insert into public.status_history (report_id, from_status, to_status, changed_by, note)
  values (r.id, null, 'PENDING', auth.uid(), 'Complaint submitted');

  return r;
end $$;

create or replace function public.cancel_report(p_report_id uuid, p_reason text default null)
returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_role(array['STUDENT']::public.user_role[]);
  if not exists (select 1 from public.maintenance_reports where id = p_report_id and student_id = auth.uid()) then
    perform public._fail('Report not found.', 'P0002');
  end if;
  r := public._transition(p_report_id, 'CANCELLED', coalesce(nullif(trim(p_reason), ''), 'Cancelled by student'));
  return r;
end $$;

-- 6.3 Supervisor -----------------------------------------------------------------

create or replace function public.review_report(
  p_report_id uuid, p_approve boolean, p_reason text default null,
  p_priority public.report_priority default null, p_category_id uuid default null
) returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_role(array['SUPERVISOR','ADMIN']::public.user_role[]);
  if not p_approve and (p_reason is null or char_length(trim(p_reason)) < 5) then
    perform public._fail('Please provide a rejection reason (at least 5 characters).', '22023');
  end if;
  if p_category_id is not null and not exists (select 1 from public.maintenance_categories where id = p_category_id and is_active) then
    perform public._fail('Invalid category.', '22023');
  end if;

  update public.maintenance_reports
     set reviewed_by = auth.uid(), reviewed_at = now(),
         priority = coalesce(p_priority, priority),
         category_id = coalesce(p_category_id, category_id),
         rejection_reason = case when p_approve then null else trim(p_reason) end
   where id = p_report_id;
  if not found then perform public._fail('Report not found.', 'P0002'); end if;

  r := public._transition(p_report_id, case when p_approve then 'APPROVED' else 'REJECTED' end::public.report_status,
                          case when p_approve then coalesce(nullif(trim(p_reason), ''), 'Complaint approved') else trim(p_reason) end);
  perform public._add_update(p_report_id, 'REVIEW',
    case when p_approve then 'Complaint reviewed and approved.' || coalesce(' ' || nullif(trim(p_reason), ''), '')
         else 'Complaint rejected: ' || trim(p_reason) end);
  return r;
end $$;

create or replace function public.triage_report(
  p_report_id uuid, p_priority public.report_priority default null, p_category_id uuid default null
) returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_role(array['SUPERVISOR','ADMIN']::public.user_role[]);
  if p_category_id is not null and not exists (select 1 from public.maintenance_categories where id = p_category_id and is_active) then
    perform public._fail('Invalid category.', '22023');
  end if;
  update public.maintenance_reports
     set priority = coalesce(p_priority, priority), category_id = coalesce(p_category_id, category_id)
   where id = p_report_id and status not in ('RESOLVED','REJECTED','CANCELLED')
   returning * into r;
  if not found then perform public._fail('Report not found or already closed.', 'P0002'); end if;
  perform public._log_activity('REPORT_TRIAGED', 'maintenance_report', p_report_id,
    jsonb_build_object('priority', r.priority, 'category_id', r.category_id));
  return r;
end $$;

create or replace function public.assign_technician(
  p_report_id uuid, p_technician_id uuid, p_instructions text default null,
  p_priority public.report_priority default null
) returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare
  r public.maintenance_reports;
  v_is_reassign boolean;
  v_tech_name text;
begin
  perform public._require_role(array['SUPERVISOR','ADMIN']::public.user_role[]);
  select full_name into v_tech_name from public.profiles
   where id = p_technician_id and role = 'TECHNICIAN' and is_active;
  if not found then perform public._fail('Selected technician is not available.', '22023'); end if;

  select * into r from public.maintenance_reports where id = p_report_id;
  if not found then perform public._fail('Report not found.', 'P0002'); end if;
  if r.current_technician_id = p_technician_id and r.status in ('ASSIGNED','ACCEPTED','IN_PROGRESS') then
    perform public._fail('This job is already assigned to that technician.', '22023');
  end if;
  v_is_reassign := r.current_technician_id is not null;

  update public.technician_assignments set status = 'REASSIGNED', ended_at = now()
   where report_id = p_report_id and status = 'ACTIVE';
  insert into public.technician_assignments (report_id, technician_id, assigned_by, instructions)
  values (p_report_id, p_technician_id, auth.uid(), nullif(trim(p_instructions), ''));

  update public.maintenance_reports
     set current_technician_id = p_technician_id,
         priority = coalesce(p_priority, priority),
         reviewed_by = coalesce(reviewed_by, auth.uid()),
         reviewed_at = coalesce(reviewed_at, now())
   where id = p_report_id;

  r := public._transition(p_report_id, 'ASSIGNED',
        case when v_is_reassign then 'Reassigned to ' else 'Assigned to ' end || v_tech_name);
  perform public._add_update(p_report_id, 'ASSIGNMENT',
    case when v_is_reassign then 'Job reassigned to ' else 'Job assigned to ' end || v_tech_name
    || coalesce('. Instructions: ' || nullif(trim(p_instructions), ''), ''), true);
  return r;
end $$;

create or replace function public.verify_completion(p_report_id uuid, p_approve boolean, p_feedback text default null)
returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_role(array['SUPERVISOR','ADMIN']::public.user_role[]);
  if not p_approve and (p_feedback is null or char_length(trim(p_feedback)) < 5) then
    perform public._fail('Please explain what needs to be corrected (at least 5 characters).', '22023');
  end if;
  if p_approve then
    update public.maintenance_reports set verified_by = auth.uid(), resolved_at = now() where id = p_report_id;
    r := public._transition(p_report_id, 'RESOLVED', coalesce(nullif(trim(p_feedback), ''), 'Work verified and approved'));
    update public.technician_assignments set status = 'COMPLETED', ended_at = now()
     where report_id = p_report_id and status = 'ACTIVE';
    perform public._add_update(p_report_id, 'RESOLUTION',
      'Work verified and complaint resolved.' || coalesce(' ' || nullif(trim(p_feedback), ''), ''));
  else
    r := public._transition(p_report_id, 'RETURNED', trim(p_feedback));
    perform public._add_update(p_report_id, 'FEEDBACK', 'Work returned for correction: ' || trim(p_feedback));
  end if;
  return r;
end $$;

-- Generic status override for supervisors (validated by the state machine).
create or replace function public.update_report_status(p_report_id uuid, p_status public.report_status, p_note text default null)
returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_role(array['SUPERVISOR','ADMIN']::public.user_role[]);
  if p_status in ('ASSIGNED') then
    perform public._fail('Use technician assignment to assign a job.', '22023');
  end if;
  if p_status = 'REJECTED' then
    return public.review_report(p_report_id, false, p_note);
  elsif p_status = 'APPROVED' then
    return public.review_report(p_report_id, true, p_note);
  elsif p_status in ('RESOLVED', 'RETURNED') then
    return public.verify_completion(p_report_id, p_status = 'RESOLVED', p_note);
  end if;
  r := public._transition(p_report_id, p_status, p_note);
  perform public._add_update(p_report_id, 'COMMENT', 'Status updated to ' || p_status || coalesce(': ' || nullif(trim(p_note), ''), ''));
  return r;
end $$;

-- 6.4 Technician -----------------------------------------------------------------

create or replace function public._require_own_job(p_report_id uuid) returns void
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_role(array['TECHNICIAN']::public.user_role[]);
  if not exists (select 1 from public.maintenance_reports
                 where id = p_report_id and current_technician_id = auth.uid()) then
    perform public._fail('This job is not assigned to you.', '42501');
  end if;
end $$;

create or replace function public.accept_job(p_report_id uuid) returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_own_job(p_report_id);
  update public.technician_assignments set accepted_at = now()
   where report_id = p_report_id and technician_id = auth.uid() and status = 'ACTIVE';
  r := public._transition(p_report_id, 'ACCEPTED', 'Job accepted by technician');
  return r;
end $$;

create or replace function public.start_job(p_report_id uuid) returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_own_job(p_report_id);
  update public.technician_assignments set accepted_at = coalesce(accepted_at, now())
   where report_id = p_report_id and technician_id = auth.uid() and status = 'ACTIVE';
  update public.maintenance_reports set started_at = coalesce(started_at, now()) where id = p_report_id;
  select * into r from public.maintenance_reports where id = p_report_id;
  r := public._transition(p_report_id, 'IN_PROGRESS',
        case when r.status = 'RETURNED' then 'Rework started' else 'Maintenance work started' end);
  return r;
end $$;

create or replace function public.add_report_update(p_report_id uuid, p_message text, p_internal boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare v_role public.user_role := public._require_role(array['SUPERVISOR','TECHNICIAN','ADMIN']::public.user_role[]);
begin
  if p_message is null or char_length(trim(p_message)) < 3 or char_length(trim(p_message)) > 2000 then
    perform public._fail('Update must be between 3 and 2000 characters.', '22023');
  end if;
  if v_role = 'TECHNICIAN' then
    perform public._require_own_job(p_report_id);
  elsif not exists (select 1 from public.maintenance_reports where id = p_report_id) then
    perform public._fail('Report not found.', 'P0002');
  end if;
  perform public._add_update(p_report_id, case when v_role = 'TECHNICIAN' then 'PROGRESS' else 'COMMENT' end,
                             p_message, coalesce(p_internal, false));
end $$;

create or replace function public.submit_completion(p_report_id uuid, p_notes text, p_photo_paths text[] default null)
returns public.maintenance_reports
language plpgsql security definer set search_path = public as $$
declare r public.maintenance_reports;
begin
  perform public._require_own_job(p_report_id);
  if p_notes is null or char_length(trim(p_notes)) < 10 or char_length(trim(p_notes)) > 2000 then
    perform public._fail('Completion notes must be between 10 and 2000 characters.', '22023');
  end if;
  perform public._attach_photos(p_report_id, 'COMPLETION', p_photo_paths);
  update public.maintenance_reports set completion_notes = trim(p_notes), completed_at = now() where id = p_report_id;
  r := public._transition(p_report_id, 'AWAITING_VERIFICATION', 'Submitted for verification');
  perform public._add_update(p_report_id, 'RESOLUTION', trim(p_notes));
  return r;
end $$;

-- 6.5 Notifications --------------------------------------------------------------

create or replace function public.mark_notification_read(p_id uuid, p_read boolean default true)
returns void language sql security definer set search_path = public as $$
  update public.notifications set is_read = p_read, read_at = case when p_read then now() end
   where id = p_id and user_id = auth.uid()
$$;

create or replace function public.mark_all_notifications_read() returns void
language sql security definer set search_path = public as $$
  update public.notifications set is_read = true, read_at = now()
   where user_id = auth.uid() and not is_read
$$;

-- 6.6 Administrator --------------------------------------------------------------

create or replace function public.admin_update_user(
  p_user_id uuid, p_full_name text, p_role public.user_role, p_department_id uuid default null,
  p_phone text default null, p_is_active boolean default true,
  p_staff_number text default null, p_job_title text default null,
  p_matric_number text default null, p_building_id uuid default null, p_room_number text default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_old public.profiles;
begin
  perform public._require_role(array['ADMIN']::public.user_role[]);
  select * into v_old from public.profiles where id = p_user_id;
  if not found then perform public._fail('User not found.', 'P0002'); end if;
  if p_user_id = auth.uid() and (p_role <> 'ADMIN' or not p_is_active) then
    perform public._fail('You cannot remove your own administrator access.', '42501');
  end if;
  if p_full_name is null or char_length(trim(p_full_name)) < 2 then
    perform public._fail('Full name must be at least 2 characters.', '22023');
  end if;

  update public.profiles
     set full_name = trim(p_full_name), role = p_role, department_id = p_department_id,
         phone = nullif(trim(p_phone), ''), is_active = p_is_active
   where id = p_user_id;

  if p_role = 'STUDENT' then
    insert into public.student_profiles (user_id) values (p_user_id) on conflict do nothing;
    update public.student_profiles
       set matric_number = nullif(upper(trim(p_matric_number)), ''), building_id = p_building_id,
           room_number = nullif(trim(p_room_number), '')
     where user_id = p_user_id;
  else
    insert into public.staff_profiles (user_id) values (p_user_id) on conflict do nothing;
    update public.staff_profiles
       set staff_number = nullif(trim(p_staff_number), ''), job_title = nullif(trim(p_job_title), '')
     where user_id = p_user_id;
  end if;
  if p_role <> 'TECHNICIAN' then
    delete from public.technician_specializations where technician_id = p_user_id;
  end if;

  perform public._log_activity('USER_UPDATED', 'profile', p_user_id,
    jsonb_build_object('role', p_role, 'previous_role', v_old.role, 'is_active', p_is_active));
end $$;

create or replace function public.admin_set_user_active(p_user_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_role(array['ADMIN']::public.user_role[]);
  if p_user_id = auth.uid() and not p_active then
    perform public._fail('You cannot deactivate your own account.', '42501');
  end if;
  update public.profiles set is_active = p_active where id = p_user_id;
  if not found then perform public._fail('User not found.', 'P0002'); end if;
  perform public._log_activity(case when p_active then 'USER_ACTIVATED' else 'USER_DEACTIVATED' end, 'profile', p_user_id);
end $$;

create or replace function public.admin_set_specializations(p_technician_id uuid, p_specialization_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_role(array['ADMIN']::public.user_role[]);
  if not exists (select 1 from public.profiles where id = p_technician_id and role = 'TECHNICIAN') then
    perform public._fail('User is not a technician.', '22023');
  end if;
  delete from public.technician_specializations where technician_id = p_technician_id;
  insert into public.technician_specializations (technician_id, specialization_id)
  select p_technician_id, unnest(coalesce(p_specialization_ids, '{}'::uuid[]))
  on conflict do nothing;
  perform public._log_activity('SPECIALIZATIONS_UPDATED', 'profile', p_technician_id,
    jsonb_build_object('specializations', p_specialization_ids));
end $$;

create or replace function public.admin_assign_department(p_user_ids uuid[], p_department_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_role(array['ADMIN']::public.user_role[]);
  update public.profiles set department_id = p_department_id
   where id = any(p_user_ids) and role <> 'STUDENT';
  perform public._log_activity('STAFF_ASSIGNED_DEPARTMENT', 'department', p_department_id,
    jsonb_build_object('users', p_user_ids));
end $$;

-- Analytics for admins and supervisors. Dates are inclusive; NULL = unbounded.
create or replace function public.report_analytics(
  p_from date default null, p_to date default null, p_department_id uuid default null
) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  perform public._require_role(array['SUPERVISOR','ADMIN']::public.user_role[]);
  with base as (
    select r.*, c.name as category_name, c.department_id, d.name as department_name, b.name as building_name
    from public.maintenance_reports r
    join public.maintenance_categories c on c.id = r.category_id
    left join public.departments d on d.id = c.department_id
    join public.buildings b on b.id = r.building_id
    where (p_from is null or r.created_at >= p_from)
      and (p_to is null or r.created_at < p_to + 1)
      and (p_department_id is null or c.department_id = p_department_id)
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'by_status', coalesce((select jsonb_object_agg(status::text, n) from (select status, count(*) n from base group by status) s), '{}'),
    'by_priority', coalesce((select jsonb_object_agg(priority::text, n) from (select priority, count(*) n from base group by priority) s), '{}'),
    'by_category', coalesce((select jsonb_agg(jsonb_build_object('name', category_name, 'count', n) order by n desc)
                    from (select category_name, count(*) n from base group by category_name) s), '[]'),
    'by_department', coalesce((select jsonb_agg(jsonb_build_object('name', coalesce(department_name, 'Unassigned'), 'count', n) order by n desc)
                    from (select department_name, count(*) n from base group by department_name) s), '[]'),
    'by_building', coalesce((select jsonb_agg(jsonb_build_object('name', building_name, 'count', n) order by n desc)
                    from (select building_name, count(*) n from base group by building_name) s), '[]'),
    'resolved', (select count(*) from base where status = 'RESOLVED'),
    'resolution_rate', (select case when count(*) filter (where status not in ('REJECTED','CANCELLED')) = 0 then 0
                          else round(100.0 * count(*) filter (where status = 'RESOLVED')
                               / count(*) filter (where status not in ('REJECTED','CANCELLED')), 1) end from base),
    'avg_resolution_hours', (select round(avg(extract(epoch from (resolved_at - created_at)) / 3600)::numeric, 1)
                             from base where resolved_at is not null),
    'monthly', coalesce((select jsonb_agg(jsonb_build_object('month', m, 'submitted', s, 'resolved', rv) order by m)
                 from (select to_char(created_at, 'YYYY-MM') m, count(*) s, count(*) filter (where status = 'RESOLVED') rv
                       from base group by 1) t), '[]'),
    'technicians', coalesce((select jsonb_agg(t order by (t ->> 'resolved')::int desc) from (
        select jsonb_build_object(
          'id', p.id, 'name', p.full_name,
          'assigned', count(distinct b.id),
          'active', count(distinct b.id) filter (where b.status in ('ASSIGNED','ACCEPTED','IN_PROGRESS','RETURNED') and b.current_technician_id = p.id),
          'resolved', count(distinct b.id) filter (where b.status = 'RESOLVED' and b.current_technician_id = p.id),
          'returned', (select count(*) from public.status_history h join base b2 on b2.id = h.report_id
                        where h.to_status = 'RETURNED' and b2.current_technician_id = p.id),
          'avg_hours', round((avg(extract(epoch from (b.completed_at - a.assigned_at)) / 3600)
                       filter (where b.completed_at is not null and b.current_technician_id = p.id))::numeric, 1)
        ) t
        from public.profiles p
        left join public.technician_assignments a on a.technician_id = p.id
        left join base b on b.id = a.report_id
        where p.role = 'TECHNICIAN'
          and (p_department_id is null or p.department_id = p_department_id or b.id is not null)
        group by p.id, p.full_name
      ) x), '[]')
  ) into v;
  return v;
end $$;

-- Audit admin changes to configuration tables.
create or replace function public.log_config_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), tg_op, tg_table_name,
          case when tg_op = 'DELETE' then old.id else new.id end,
          jsonb_build_object('name', case when tg_op = 'DELETE' then old.name else new.name end));
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['departments','specializations','buildings','locations','maintenance_categories']
  loop
    execute format('drop trigger if exists trg_log_%1$s on public.%1$s', t);
    execute format('create trigger trg_log_%1$s after insert or update or delete on public.%1$s
                    for each row execute function public.log_config_change()', t);
  end loop;
end $$;

-- - 7. ROW LEVEL SECURITY -

alter table public.departments               enable row level security;
alter table public.specializations           enable row level security;
alter table public.buildings                 enable row level security;
alter table public.locations                 enable row level security;
alter table public.maintenance_categories    enable row level security;
alter table public.profiles                  enable row level security;
alter table public.student_profiles          enable row level security;
alter table public.staff_profiles            enable row level security;
alter table public.technician_specializations enable row level security;
alter table public.maintenance_reports       enable row level security;
alter table public.report_photos             enable row level security;
alter table public.technician_assignments    enable row level security;
alter table public.status_history            enable row level security;
alter table public.report_updates            enable row level security;
alter table public.notifications             enable row level security;
alter table public.activity_log              enable row level security;

-- Reference data: readable by everyone (registration form needs buildings),
-- writable only by administrators.
do $$
declare t text;
begin
  foreach t in array array['departments','specializations','buildings','locations','maintenance_categories']
  loop
    execute format('drop policy if exists "%1$s_read" on public.%1$s', t);
    execute format('create policy "%1$s_read" on public.%1$s for select using (true)', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$s', t);
    execute format('create policy "%1$s_admin_write" on public.%1$s for all
                    using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Profiles: self; staff see everyone; students see staff (names on their reports).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid() or public.is_staff()
  or (public.current_user_role() = 'STUDENT' and role <> 'STUDENT')
);
-- No direct UPDATE/INSERT/DELETE: use update_my_profile / admin_* RPCs.

drop policy if exists student_profiles_select on public.student_profiles;
create policy student_profiles_select on public.student_profiles for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists staff_profiles_select on public.staff_profiles;
create policy staff_profiles_select on public.staff_profiles for select
  using (public.current_user_role() is not null);

drop policy if exists tech_specs_select on public.technician_specializations;
create policy tech_specs_select on public.technician_specializations for select
  using (public.current_user_role() is not null);

-- Reports & related records: visibility follows can_view_report().
drop policy if exists reports_select on public.maintenance_reports;
-- can_view_report() is SECURITY DEFINER, which avoids recursive RLS between
-- maintenance_reports and technician_assignments.
create policy reports_select on public.maintenance_reports for select using (public.can_view_report(id));

drop policy if exists photos_select on public.report_photos;
create policy photos_select on public.report_photos for select using (public.can_view_report(report_id));

drop policy if exists assignments_select on public.technician_assignments;
create policy assignments_select on public.technician_assignments for select using (
  technician_id = auth.uid() or public.is_supervisor_or_admin() or public.can_view_report(report_id)
);

drop policy if exists history_select on public.status_history;
create policy history_select on public.status_history for select using (public.can_view_report(report_id));

drop policy if exists updates_select on public.report_updates;
create policy updates_select on public.report_updates for select using (
  public.can_view_report(report_id) and (not is_internal or public.is_staff())
);

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select using (user_id = auth.uid());
drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications for delete using (user_id = auth.uid());

drop policy if exists activity_select on public.activity_log;
create policy activity_select on public.activity_log for select using (public.is_admin());

-- Lock down function execution: internal helpers are not callable by clients.
revoke execute on function public._fail(text, text) from public, anon, authenticated;
revoke execute on function public._notify(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public._transition(uuid, public.report_status, text) from public, anon, authenticated;
revoke execute on function public._add_update(uuid, text, text, boolean) from public, anon, authenticated;
revoke execute on function public._attach_photos(uuid, text, text[]) from public, anon, authenticated;
revoke execute on function public._log_activity(text, text, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public._report_supervisors(uuid) from public, anon, authenticated;

-- - 8. STORAGE -
-- Private bucket. Objects are stored as "<uploader-uid>/<uuid>.<ext>".
-- Uploaders can always read their own files; anyone who can view the linked
-- report can read its photos (via signed URLs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "report photos upload own folder" on storage.objects;
create policy "report photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos'
              and (storage.foldername(name))[1] = auth.uid()::text
              and public.current_user_role() is not null);

drop policy if exists "report photos read" on storage.objects;
create policy "report photos read" on storage.objects for select to authenticated
  using (bucket_id = 'report-photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.report_photos p
               where p.storage_path = storage.objects.name and public.can_view_report(p.report_id))
  ));

drop policy if exists "avatars public read" on storage.objects;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars write own" on storage.objects;
create policy "avatars write own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- - 9. REALTIME -

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.maintenance_reports;
exception when others then null; end $$;
