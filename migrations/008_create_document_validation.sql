-- Create table to store document validation status per property
CREATE TABLE IF NOT EXISTS document_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('OS', 'RR', 'OM')),
  is_validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one validation record per property/document_type combination
  UNIQUE(property_id, document_type)
);

-- Create index for faster lookups by property_id
CREATE INDEX IF NOT EXISTS idx_document_validation_property_id 
  ON document_validation(property_id);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_document_validation_status 
  ON document_validation(property_id, document_type, is_validated);

-- Add comment for documentation
COMMENT ON TABLE document_validation IS 'Stores the validation status of documents (OS, RR, OM) per property';
COMMENT ON COLUMN document_validation.property_id IS 'Reference to the property';
COMMENT ON COLUMN document_validation.document_type IS 'Type of document: OS (Operating Statement), RR (Rent Roll), OM (Offering Memorandum)';
COMMENT ON COLUMN document_validation.is_validated IS 'Whether the document has been validated by the user';
COMMENT ON COLUMN document_validation.validated_at IS 'Timestamp when the validation was completed';
COMMENT ON COLUMN document_validation.validated_by IS 'User ID or email of who validated the document';
