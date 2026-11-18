-- ==============================================================================
-- Cosmopolitan University Campus Maintenance System
-- Pure Backend-as-a-Service (BaaS) Schema & Security Policies for Supabase
-- ==============================================================================
-- Run this complete script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. REFERENCE TABLES ────────────────────────────────────────────────────────

-- Hostel Blocks
CREATE TABLE IF NOT EXISTS public.hostel_blocks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue Categories
CREATE TABLE IF NOT EXISTS public.issue_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Wrench',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. PROFILES TABLE (Mirrors auth.users) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'SUPERVISOR', 'WORKER', 'ADMIN')),
  hostel_block TEXT,
  hostel_block_id TEXT REFERENCES public.hostel_blocks(id) ON DELETE SET NULL,
  room_number TEXT,
  matric_number TEXT,
  department TEXT,
  specialty TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. REPORTS TABLE ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  hostel_block TEXT NOT NULL,
  hostel_block_id TEXT REFERENCES public.hostel_blocks(id) ON DELETE SET NULL,
  room_number TEXT NOT NULL,
  image_url TEXT,
  resolution_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_VERIFICATION', 'RESOLVED', 'REJECTED', 'CANCELLED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT,
  assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_name TEXT,
  worker_notes TEXT,
  supervisor_notes TEXT,
  verified_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. NOTIFICATIONS TABLE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'GENERAL',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. AUTOMATIC TRACKING CODE GENERATOR ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TRIGGER AS $$
DECLARE
  seq_num TEXT;
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    seq_num := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    NEW.tracking_code := 'CU-' || TO_CHAR(NOW(), 'YYYY') || '-' || seq_num;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_tracking_code ON public.reports;
CREATE TRIGGER trg_generate_tracking_code
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.generate_tracking_code();

-- ── 6. AUTOMATIC AUTH USER PROFILE SYNC TRIGGER ──────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    hostel_block,
    room_number,
    matric_number,
    department,
    is_verified,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    COALESCE(NEW.raw_user_meta_data->>'hostel_block', 'Hostel Block A'),
    COALESCE(NEW.raw_user_meta_data->>'room_number', '101'),
    COALESCE(NEW.raw_user_meta_data->>'matric_number', 'CU/' || TO_CHAR(NOW(), 'YYYY') || '/001'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Undergraduate Studies'),
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::BOOLEAN, FALSE),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 7. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────────────

ALTER TABLE public.hostel_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Reference tables policies (Public read, admin write)
CREATE POLICY "Public read hostel blocks" ON public.hostel_blocks FOR SELECT USING (true);
CREATE POLICY "Public read issue categories" ON public.issue_categories FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin update any profile" ON public.profiles FOR UPDATE USING (public.current_user_role() = 'ADMIN');

-- Reports policies
-- 1. Students see their own reports; Supervisors, Workers, and Admins can see all reports
CREATE POLICY "View reports policy" ON public.reports FOR SELECT USING (
  auth.uid() = student_id 
  OR public.current_user_role() IN ('SUPERVISOR', 'WORKER', 'ADMIN')
  OR true -- Allow read access for public university tracking
);

-- 2. Students can insert reports
CREATE POLICY "Create report policy" ON public.reports FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- 3. Update reports policy (Supervisors assign/verify, Workers execute, Admins oversee)
CREATE POLICY "Update report policy" ON public.reports FOR UPDATE USING (
  public.current_user_role() IN ('SUPERVISOR', 'WORKER', 'ADMIN')
  OR auth.uid() = student_id
);

-- Notifications policies
CREATE POLICY "View own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── 8. SUPABASE STORAGE (Photo Evidence Bucket) ──────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-evidence', 'maintenance-evidence', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view evidence photos" ON storage.objects
FOR SELECT USING (bucket_id = 'maintenance-evidence');

CREATE POLICY "Authenticated users upload evidence photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'maintenance-evidence' 
  AND auth.role() = 'authenticated'
);

-- ── 9. SEED REFERENCE DATA ───────────────────────────────────────────────────

INSERT INTO public.hostel_blocks (id, name, code, description) VALUES
  ('blk-a', 'Hostel Block A', 'BLK-A', 'Female Undergraduate Hall — Blocks A1–A4'),
  ('blk-b', 'Hostel Block B', 'BLK-B', 'Male Undergraduate Hall — Blocks B1–B4'),
  ('blk-c', 'Hostel Block C', 'BLK-C', 'Senior & Postgraduate Hall'),
  ('blk-d', 'Hostel Block D', 'BLK-D', 'Freshmen Onboarding Hall')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.issue_categories (id, name, icon, description) VALUES
  ('cat-plumbing', 'Plumbing', 'Droplets', 'Pipes, faucets, water heaters, and drainage'),
  ('cat-electrical', 'Electrical', 'Zap', 'Lighting, power sockets, AC units, and wiring'),
  ('cat-carpentry', 'Carpentry', 'Hammer', 'Doors, window latches, beds, and study desks'),
  ('cat-sanitation', 'Sanitation', 'Trash2', 'Waste disposal and sanitary inspection'),
  ('cat-general', 'General Maintenance', 'Wrench', 'Masonry, painting, ceiling tiles, and locks'),
  ('cat-network', 'Network / Connectivity', 'Wifi', 'Campus Wi-Fi routers and LAN access points')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Realtime publication enablement
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
