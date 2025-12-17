-- Migration: Create Supabase Storage bucket for documents
-- This creates a private bucket with RLS policies for company-based access

-- Create the storage bucket (run in Supabase Dashboard SQL Editor or via API)
-- Note: Bucket creation is typically done via Supabase Dashboard or Admin API
-- This SQL is for reference and RLS policies

-- Storage bucket configuration (for Supabase Dashboard):
-- Bucket name: documents
-- Public: false (private)
-- File size limit: 50MB
-- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, image/*

-- RLS Policies for storage.objects table
-- These policies control access to files in the 'documents' bucket

-- Enable RLS on storage.objects if not already enabled
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload files to their company's folder
CREATE POLICY "Users can upload to company folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);

-- Policy: Users can view files from their company's folder
CREATE POLICY "Users can view company files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);

-- Policy: Users can update files in their company's folder
CREATE POLICY "Users can update company files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);

-- Policy: Users can delete files from their company's folder
CREATE POLICY "Users can delete company files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);

-- Note: To create the bucket, run this in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket named "documents"
-- 3. Set it to Private
-- 4. Apply the above policies via SQL Editor
