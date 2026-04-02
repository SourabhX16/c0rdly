-- ============================================================
-- c0rdly – Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'school' CHECK (role IN ('admin', 'school')),
  school_name TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scholar_no TEXT NOT NULL,
  roll_no TEXT NOT NULL DEFAULT '',
  sssm_id TEXT,
  family_id TEXT,
  aadhar_no TEXT,
  dob DATE NOT NULL,
  class TEXT NOT NULL,
  section TEXT,
  medium TEXT NOT NULL DEFAULT 'Hindi',
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Report Cards table (uses JSONB for flexible data)
CREATE TABLE IF NOT EXISTS public.report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session TEXT NOT NULL DEFAULT '2024-25',
  scholastic_data JSONB DEFAULT '[]'::jsonb,
  co_scholastic_data JSONB DEFAULT '[]'::jsonb,
  personal_qualities JSONB DEFAULT '[]'::jsonb,
  attendance JSONB DEFAULT '{}'::jsonb,
  teacher_remarks TEXT,
  promoted_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class);
CREATE INDEX IF NOT EXISTS idx_report_cards_student_id ON public.report_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_school_id ON public.report_cards(school_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- STUDENTS policies
CREATE POLICY "Schools can read own students"
  ON public.students FOR SELECT
  USING (school_id = auth.uid());

CREATE POLICY "Admin can read all students"
  ON public.students FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Schools can insert own students"
  ON public.students FOR INSERT
  WITH CHECK (school_id = auth.uid());

CREATE POLICY "Schools can update own students"
  ON public.students FOR UPDATE
  USING (school_id = auth.uid());

CREATE POLICY "Schools can delete own students"
  ON public.students FOR DELETE
  USING (school_id = auth.uid());

-- REPORT_CARDS policies
CREATE POLICY "Schools can read own reports"
  ON public.report_cards FOR SELECT
  USING (school_id = auth.uid());

CREATE POLICY "Admin can read all reports"
  ON public.report_cards FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Schools can insert own reports"
  ON public.report_cards FOR INSERT
  WITH CHECK (school_id = auth.uid());

CREATE POLICY "Schools can update own reports"
  ON public.report_cards FOR UPDATE
  USING (school_id = auth.uid());

CREATE POLICY "Schools can delete own reports"
  ON public.report_cards FOR DELETE
  USING (school_id = auth.uid());

-- ============================================================
-- Admin seed (run after creating admin user via Supabase Auth)
-- Replace 'ADMIN_USER_UUID' with actual UUID from auth.users
-- ============================================================
-- INSERT INTO public.profiles (id, role, school_name, contact_email)
-- VALUES ('ADMIN_USER_UUID', 'admin', 'c0rdly Admin', 'admin@c0rdly.com');

-- ============================================================
-- Storage Bucket for school logos / assets
-- Run in Supabase SQL Editor if bucket does not exist
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('school-assets', 'school-assets', true);
--
-- CREATE POLICY "Authenticated users can upload logos"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'school-assets');
--
-- CREATE POLICY "Anyone can view assets"
--   ON storage.objects FOR SELECT TO public
--   USING (bucket_id = 'school-assets');
--
-- CREATE POLICY "Users can update own logos"
--   ON storage.objects FOR UPDATE TO authenticated
--   USING (bucket_id = 'school-assets');

