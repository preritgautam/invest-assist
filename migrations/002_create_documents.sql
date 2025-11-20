-- Create documents table for storing user-uploaded documents
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,  -- Clerk user ID
  process_id VARCHAR(255) UNIQUE NOT NULL,  -- REX process ID
  document_id VARCHAR(255),  -- REX document ID from extraction
  filename VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),  -- e.g., 'rent_roll', 'lease', etc.
  file_size BIGINT,
  upload_status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
  extraction_status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
  extraction_result JSONB,  -- Stores the extracted data from REX
  error_message TEXT,  -- Error details if extraction fails
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,  -- Soft delete support
  CONSTRAINT fk_user_id UNIQUE (user_id, process_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_process_id ON documents(process_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_status ON documents(upload_status);
CREATE INDEX IF NOT EXISTS idx_documents_extraction_status ON documents(extraction_status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);

-- Create a function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_documents_updated_at ON documents;
CREATE TRIGGER trigger_update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_documents_updated_at();
