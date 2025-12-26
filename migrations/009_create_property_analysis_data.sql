-- Migration: Create property_analysis_data table
-- Stores user-edited document extraction data for properties

CREATE TABLE IF NOT EXISTS property_analysis_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- From Operating Statement
  actual_rent_collected DECIMAL(15, 2),
  other_income DECIMAL(15, 2),
  total_operating_expenses DECIMAL(15, 2),
  property_taxes DECIMAL(15, 2),
  insurance DECIMAL(15, 2),
  payroll DECIMAL(15, 2),
  repairs_maintenance DECIMAL(15, 2),
  utilities DECIMAL(15, 2),
  contract_services DECIMAL(15, 2),
  management_fee DECIMAL(15, 2),
  replacement_reserve DECIMAL(15, 2),
  total_noi DECIMAL(15, 2),
  
  -- From Rent Roll
  unit_count INTEGER,
  avg_rent_per_unit DECIMAL(15, 2),
  market_rent_per_unit DECIMAL(15, 2),
  occupancy_percent DECIMAL(5, 2),
  loss_to_lease_percent DECIMAL(5, 2),
  concessions_percent DECIMAL(5, 2),
  vacancy_loss DECIMAL(15, 2),
  credit_loss DECIMAL(15, 2),
  
  -- From Offering Memorandum
  property_name VARCHAR(255),
  year_built INTEGER,
  renovation_year INTEGER,
  square_footage INTEGER,
  market_rent_comparable DECIMAL(15, 2),
  market_vacancy_rate DECIMAL(5, 2),
  expense_ratio_benchmark DECIMAL(5, 2),
  
  -- Edit tracking flag - true if user has edited any field
  is_edited BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Ensure one record per property per company
  CONSTRAINT unique_property_analysis UNIQUE (property_id, company_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_property_analysis_property_id ON property_analysis_data(property_id);
CREATE INDEX IF NOT EXISTS idx_property_analysis_company_id ON property_analysis_data(company_id);

-- Enable Row Level Security
ALTER TABLE property_analysis_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see data from their company
CREATE POLICY "Users can view their company analysis data"
ON property_analysis_data FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can insert data for their company
CREATE POLICY "Users can insert their company analysis data"
ON property_analysis_data FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can update their company analysis data
CREATE POLICY "Users can update their company analysis data"
ON property_analysis_data FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can delete their company analysis data
CREATE POLICY "Users can delete their company analysis data"
ON property_analysis_data FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- Create a function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_property_analysis_updated_at ON property_analysis_data;
CREATE TRIGGER trigger_property_analysis_updated_at
  BEFORE UPDATE ON property_analysis_data
  FOR EACH ROW
  EXECUTE FUNCTION update_property_analysis_updated_at();
