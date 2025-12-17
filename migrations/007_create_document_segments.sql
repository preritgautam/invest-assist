-- Migration: Create document_segments table for multi-extraction support
-- This separates the physical file (documents) from logical segments within it

-- Add new columns to documents table for source file tracking
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_source_file BOOLEAN DEFAULT true;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_document_id INTEGER REFERENCES documents(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS total_pages INTEGER;

-- Add period/date tracking for different document instances
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_date DATE;  -- "As of" date for RR, or single date for other docs
ALTER TABLE documents ADD COLUMN IF NOT EXISTS period_start DATE;   -- For T-12/OS: start of period
ALTER TABLE documents ADD COLUMN IF NOT EXISTS period_end DATE;     -- For T-12/OS: end of period
ALTER TABLE documents ADD COLUMN IF NOT EXISTS period_label VARCHAR(100);  -- Human readable: "T-12 Jan-Dec 2024", "As of Dec 15, 2024"

-- Track which segment is currently active/preferred for analysis
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add segment order for display (when multiple segments from same source)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS segment_order INTEGER DEFAULT 0;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_documents_source_document_id ON documents(source_document_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_date ON documents(document_date);
CREATE INDEX IF NOT EXISTS idx_documents_period_start ON documents(period_start);
CREATE INDEX IF NOT EXISTS idx_documents_period_end ON documents(period_end);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON documents(is_active);
CREATE INDEX IF NOT EXISTS idx_documents_is_source_file ON documents(is_source_file);

-- Composite index for finding active documents of a type for a property
CREATE INDEX IF NOT EXISTS idx_documents_property_type_active
ON documents(property_id, document_type, is_active)
WHERE deleted_at IS NULL;

-- Composite index for finding segments of a source file
CREATE INDEX IF NOT EXISTS idx_documents_source_segments
ON documents(source_document_id, segment_order)
WHERE source_document_id IS NOT NULL;

-- Comment explaining the data model
COMMENT ON TABLE documents IS 'Stores both source files (is_source_file=true) and extracted segments (is_source_file=false, source_document_id set). A single uploaded PDF might result in multiple segment records if it contains both RR and OS data.';

COMMENT ON COLUMN documents.is_source_file IS 'True for original uploaded files, false for segments extracted from a source file';
COMMENT ON COLUMN documents.source_document_id IS 'References the original uploaded file this segment was extracted from';
COMMENT ON COLUMN documents.page_range IS 'Page range within source file, e.g., "1-5", "10-15", or "all"';
COMMENT ON COLUMN documents.sheet_index IS 'Sheet index for Excel files (0-based)';
COMMENT ON COLUMN documents.document_date IS 'The "as of" date for the document (e.g., rent roll as of Dec 15, 2024)';
COMMENT ON COLUMN documents.period_start IS 'Start date of period for T-12/OS documents';
COMMENT ON COLUMN documents.period_end IS 'End date of period for T-12/OS documents';
COMMENT ON COLUMN documents.period_label IS 'Human-readable period label like "T-12 Jan-Dec 2024"';
COMMENT ON COLUMN documents.is_active IS 'Whether this is the currently active document for its type (for analysis)';
COMMENT ON COLUMN documents.total_pages IS 'Total pages in the source file';
