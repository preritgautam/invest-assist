-- Migration: Create property_assumptions table
-- Stores user underwriting assumptions for properties

CREATE TABLE IF NOT EXISTS property_assumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Deal Overview
  purchase_price DECIMAL(15, 2),
  hold_period INTEGER,
  reversion_cap_rate DECIMAL(5, 2),
  exit_costs_percent DECIMAL(5, 2),
  
  -- Market & Income Assumptions
  rent_growth DECIMAL(5, 2),
  vacancy_percent DECIMAL(5, 2),
  credit_loss_percent DECIMAL(5, 2),
  concessions_percent DECIMAL(5, 2),
  other_income_growth DECIMAL(5, 2),
  
  -- Expense Assumptions
  management_fee_percent DECIMAL(5, 2),
  payroll_per_unit DECIMAL(15, 2),
  repairs_per_unit DECIMAL(15, 2),
  utilities_per_unit DECIMAL(15, 2),
  insurance_per_unit DECIMAL(15, 2),
  marketing_per_unit DECIMAL(15, 2),
  contract_services_per_unit DECIMAL(15, 2),
  replacement_reserves_per_unit DECIMAL(15, 2),
  expense_inflation DECIMAL(5, 2),
  
  -- Capital & Debt
  loan_amount DECIMAL(15, 2),
  ltv_percent DECIMAL(5, 2),
  interest_rate DECIMAL(5, 2),
  amortization_years INTEGER,
  loan_term_years INTEGER,
  interest_only_years INTEGER,
  dscr_target DECIMAL(5, 2),
  initial_reserves DECIMAL(15, 2),
  capex_reserve_per_unit DECIMAL(15, 2),
  
  -- Freeze/Lock status - true if assumptions are finalized
  is_frozen BOOLEAN DEFAULT FALSE,
  frozen_at TIMESTAMP WITH TIME ZONE,
  frozen_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Ensure one set of assumptions per property per company
  UNIQUE(property_id, company_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_assumptions_property_id ON property_assumptions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_assumptions_company_id ON property_assumptions(company_id);
CREATE INDEX IF NOT EXISTS idx_property_assumptions_is_frozen ON property_assumptions(is_frozen);

-- Enable Row Level Security
ALTER TABLE property_assumptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access assumptions for their company
CREATE POLICY "Users can view their company assumptions"
  ON property_assumptions
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert assumptions for their company"
  ON property_assumptions
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their company assumptions"
  ON property_assumptions
  FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete their company assumptions"
  ON property_assumptions
  FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_assumptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_assumptions_updated_at
  BEFORE UPDATE ON property_assumptions
  FOR EACH ROW
  EXECUTE FUNCTION update_property_assumptions_updated_at();

-- Add comment to table
COMMENT ON TABLE property_assumptions IS 'Stores user underwriting assumptions for property analysis. Can be frozen to lock values.';
COMMENT ON COLUMN property_assumptions.is_frozen IS 'When true, assumptions are locked and cannot be edited without unfreezing first.';
