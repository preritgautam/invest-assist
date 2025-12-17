-- Migration: Alter documents table for multi-tenancy and storage
-- Add company_id, property_id, storage_path, and classification fields

-- Add new columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path TEXT;  -- Supabase Storage path
ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_range VARCHAR(50);  -- e.g., "1-5" or "all"
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sheet_index INTEGER;  -- For Excel files
ALTER TABLE documents ADD COLUMN IF NOT EXISTS classification_result JSONB;  -- Vision LLM output
ALTER TABLE documents ADD COLUMN IF NOT EXISTS classification_status VARCHAR(50) DEFAULT 'pending';  -- pending, processing, completed, failed

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_storage_path ON documents(storage_path);
CREATE INDEX IF NOT EXISTS idx_documents_classification_status ON documents(classification_status);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate with company filtering)
DROP POLICY IF EXISTS "Users can view their documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their documents" ON documents;
DROP POLICY IF EXISTS "Users can update their documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their documents" ON documents;

-- RLS Policy: Users can only see documents from their company
CREATE POLICY "Users can view their company documents"
ON documents FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
  OR user_id = auth.uid()::text  -- Backward compatibility for old documents
);

-- RLS Policy: Users can insert documents for their company
CREATE POLICY "Users can insert their company documents"
ON documents FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
  OR user_id = auth.uid()::text  -- Backward compatibility
);

-- RLS Policy: Users can update their company documents
CREATE POLICY "Users can update their company documents"
ON documents FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
  OR user_id = auth.uid()::text  -- Backward compatibility
);

-- RLS Policy: Users can delete their company documents
CREATE POLICY "Users can delete their company documents"
ON documents FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
  OR user_id = auth.uid()::text  -- Backward compatibility
);
