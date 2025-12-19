-- Migration: Create property_images table for OM image extraction
-- This stores images extracted from Offering Memorandums and their AI analysis

CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,

  -- Image info
  filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,  -- Path in Supabase Storage
  image_url TEXT,  -- Public URL or signed URL

  -- Source info (where in the OM this came from)
  source_page INTEGER,  -- Page number in OM where image was found

  -- AI Classification
  image_category VARCHAR(100),  -- exterior, interior, amenity, aerial, map, floorplan, other
  image_subcategory VARCHAR(100),  -- living_room, kitchen, pool, gym, etc.

  -- AI Analysis Results
  ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 10),  -- 1-10 rating
  ai_positives TEXT[],  -- Array of positive aspects
  ai_negatives TEXT[],  -- Array of negative/concern aspects
  ai_description TEXT,  -- AI-generated description
  ai_analysis JSONB,  -- Full AI analysis response

  -- Display order and flags
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,  -- Is this the primary/hero image
  is_thumbnail BOOLEAN DEFAULT false,  -- Used as thumbnail

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_company_id ON property_images(company_id);
CREATE INDEX IF NOT EXISTS idx_property_images_document_id ON property_images(document_id);
CREATE INDEX IF NOT EXISTS idx_property_images_category ON property_images(image_category);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary) WHERE is_primary = true;

-- Composite index for fetching property images in order
CREATE INDEX IF NOT EXISTS idx_property_images_property_order
ON property_images(property_id, display_order);

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_property_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_property_images_updated_at ON property_images;
CREATE TRIGGER trigger_update_property_images_updated_at
BEFORE UPDATE ON property_images
FOR EACH ROW
EXECUTE FUNCTION update_property_images_updated_at();

-- Enable Row Level Security
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see images from their company
CREATE POLICY "Users can view their company property images"
ON property_images FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can insert images for their company
CREATE POLICY "Users can insert their company property images"
ON property_images FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can update their company property images
CREATE POLICY "Users can update their company property images"
ON property_images FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can delete their company property images
CREATE POLICY "Users can delete their company property images"
ON property_images FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- Add comments
COMMENT ON TABLE property_images IS 'Stores property images extracted from Offering Memorandums with AI analysis';
COMMENT ON COLUMN property_images.image_category IS 'AI-classified category: exterior, interior, amenity, aerial, map, floorplan, other';
COMMENT ON COLUMN property_images.ai_rating IS 'AI-assigned quality/appeal rating from 1-10';
COMMENT ON COLUMN property_images.ai_positives IS 'Array of positive aspects identified by AI';
COMMENT ON COLUMN property_images.ai_negatives IS 'Array of negative aspects or concerns identified by AI';
