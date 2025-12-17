-- Migration: Create properties table
-- This table stores property information for each company

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Basic info (can be null initially, filled after extraction)
  name VARCHAR(255),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),

  -- Status
  status VARCHAR(50) DEFAULT 'processing',  -- processing, active, archived

  -- Visual
  thumbnail_url TEXT,

  -- Financial metrics (nullable, filled after extraction)
  offer_price DECIMAL(15,2),
  cap_rate DECIMAL(5,2),
  units INTEGER,
  year_built INTEGER,
  occupancy DECIMAL(5,2),
  avg_sqft_per_unit DECIMAL(10,2),

  -- Additional metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_company_id ON properties(company_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at);

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_properties_updated_at ON properties;
CREATE TRIGGER trigger_update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_properties_updated_at();

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see properties from their company
CREATE POLICY "Users can view their company properties"
ON properties FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can insert properties for their company
CREATE POLICY "Users can insert their company properties"
ON properties FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can update their company properties
CREATE POLICY "Users can update their company properties"
ON properties FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can delete their company properties
CREATE POLICY "Users can delete their company properties"
ON properties FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);
