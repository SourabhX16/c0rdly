-- Migration 004: Storage Bucket for Form Uploads
-- Creates the form-uploads bucket and sets up RLS policies

INSERT INTO storage.buckets (id, name, public)
VALUES ('form-uploads', 'form-uploads', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can upload to form-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'form-uploads');

CREATE POLICY "Admins can read form-uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'form-uploads' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete form-uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'form-uploads' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
