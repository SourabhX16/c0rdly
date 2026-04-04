-- ============================================================
-- Add database constraints and indexes for performance
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add CHECK constraint for form_responses.status
ALTER TABLE public.form_responses 
DROP CONSTRAINT IF EXISTS form_responses_status_check;

ALTER TABLE public.form_responses 
ADD CONSTRAINT form_responses_status_check 
CHECK (status IN ('Received', 'In Progress', 'Done'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_responses_created_at_desc 
ON public.form_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_responses_status 
ON public.form_responses(status);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_form_responses_form_org 
ON public.form_responses(form_id, org_name);

-- Index for org name searches
CREATE INDEX IF NOT EXISTS idx_form_responses_org_name_trgm 
ON public.form_responses USING gin(org_name gin_trgm_ops);

-- Enable pg_trgm extension for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
