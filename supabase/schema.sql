-- ============================================================
-- GPRS – Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  organization_name TEXT, -- The name of the GPRS Admin organization
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
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

CREATE POLICY "Clients can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- ============================================================
-- Admin seed (run after creating admin user via Supabase Auth)
-- Replace 'ADMIN_USER_UUID' with actual UUID from auth.users
-- ============================================================
-- INSERT INTO public.profiles (id, role, contact_email)
-- VALUES ('ADMIN_USER_UUID', 'admin', 'admin@gprs.com');

-- ============================================================
-- Forms and Form Responses for Dynamic Form Management
-- ============================================================

-- 2. Forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]'::jsonb, -- Array of field definitions
  share_url_id UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Form Responses table
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  org_name TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  raw_file_path TEXT, -- Nullable path to the uploaded CSV/Excel in storage
  status TEXT NOT NULL DEFAULT 'Received',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON public.forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_share_url_id ON public.forms(share_url_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_org_name ON public.form_responses(org_name);

-- RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Admin can completely manage forms"
  ON public.forms FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view forms by share_url_id"
  ON public.forms FOR SELECT
  USING (true); -- Public forms are readable by anyone so they can see the schema

-- Form Responses policies
CREATE POLICY "Admin can read and delete all responses"
  ON public.form_responses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can insert responses"
  ON public.form_responses FOR INSERT
  WITH CHECK (true);

-- Enable raw-files storage bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('form-uploads', 'form-uploads', false);
