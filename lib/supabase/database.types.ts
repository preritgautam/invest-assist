export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          company_id: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_id?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_id?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          company_id: string
          name: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          status: string
          thumbnail_url: string | null
          offer_price: number | null
          cap_rate: number | null
          units: number | null
          year_built: number | null
          occupancy: number | null
          avg_sqft_per_unit: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          status?: string
          thumbnail_url?: string | null
          offer_price?: number | null
          cap_rate?: number | null
          units?: number | null
          year_built?: number | null
          occupancy?: number | null
          avg_sqft_per_unit?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          status?: string
          thumbnail_url?: string | null
          offer_price?: number | null
          cap_rate?: number | null
          units?: number | null
          year_built?: number | null
          occupancy?: number | null
          avg_sqft_per_unit?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      scenarios: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          payload: Json
          deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          payload?: Json
          deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          payload?: Json
          deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          company_id: string
          document_id: number | null
          filename: string
          storage_path: string
          image_url: string | null
          source_page: number | null
          image_category: string | null
          image_subcategory: string | null
          ai_rating: number | null
          ai_positives: string[] | null
          ai_negatives: string[] | null
          ai_description: string | null
          ai_analysis: Json | null
          display_order: number
          is_primary: boolean
          is_thumbnail: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          company_id: string
          document_id?: number | null
          filename: string
          storage_path: string
          image_url?: string | null
          source_page?: number | null
          image_category?: string | null
          image_subcategory?: string | null
          ai_rating?: number | null
          ai_positives?: string[] | null
          ai_negatives?: string[] | null
          ai_description?: string | null
          ai_analysis?: Json | null
          display_order?: number
          is_primary?: boolean
          is_thumbnail?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          company_id?: string
          document_id?: number | null
          filename?: string
          storage_path?: string
          image_url?: string | null
          source_page?: number | null
          image_category?: string | null
          image_subcategory?: string | null
          ai_rating?: number | null
          ai_positives?: string[] | null
          ai_negatives?: string[] | null
          ai_description?: string | null
          ai_analysis?: Json | null
          display_order?: number
          is_primary?: boolean
          is_thumbnail?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: number
          user_id: string
          company_id: string | null
          property_id: string | null
          process_id: string
          document_id: string | null
          filename: string
          document_type: string | null
          file_size: number | null
          storage_path: string | null
          page_range: string | null
          sheet_index: number | null
          upload_status: string
          extraction_status: string
          classification_status: string | null
          extraction_result: Json | null
          classification_result: Json | null
          error_message: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          // New segment-related fields
          is_source_file: boolean
          source_document_id: number | null
          total_pages: number | null
          document_date: string | null
          period_start: string | null
          period_end: string | null
          period_label: string | null
          is_active: boolean
          segment_order: number
        }
        Insert: {
          id?: number
          user_id: string
          company_id?: string | null
          property_id?: string | null
          process_id: string
          document_id?: string | null
          filename: string
          document_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          page_range?: string | null
          sheet_index?: number | null
          upload_status?: string
          extraction_status?: string
          classification_status?: string | null
          extraction_result?: Json | null
          classification_result?: Json | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          // New segment-related fields
          is_source_file?: boolean
          source_document_id?: number | null
          total_pages?: number | null
          document_date?: string | null
          period_start?: string | null
          period_end?: string | null
          period_label?: string | null
          is_active?: boolean
          segment_order?: number
        }
        Update: {
          id?: number
          user_id?: string
          company_id?: string | null
          property_id?: string | null
          process_id?: string
          document_id?: string | null
          filename?: string
          document_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          page_range?: string | null
          sheet_index?: number | null
          upload_status?: string
          extraction_status?: string
          classification_status?: string | null
          extraction_result?: Json | null
          classification_result?: Json | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          // New segment-related fields
          is_source_file?: boolean
          source_document_id?: number | null
          total_pages?: number | null
          document_date?: string | null
          period_start?: string | null
          period_end?: string | null
          period_label?: string | null
          is_active?: boolean
          segment_order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Company = Database['public']['Tables']['companies']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Scenario = Database['public']['Tables']['scenarios']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type PropertyImage = Database['public']['Tables']['property_images']['Row']

export type NewCompany = Database['public']['Tables']['companies']['Insert']
export type NewUser = Database['public']['Tables']['users']['Insert']
export type NewProperty = Database['public']['Tables']['properties']['Insert']
export type NewScenario = Database['public']['Tables']['scenarios']['Insert']
export type NewDocument = Database['public']['Tables']['documents']['Insert']
export type NewPropertyImage = Database['public']['Tables']['property_images']['Insert']

export type UpdateCompany = Database['public']['Tables']['companies']['Update']
export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateProperty = Database['public']['Tables']['properties']['Update']
export type UpdateScenario = Database['public']['Tables']['scenarios']['Update']
export type UpdateDocument = Database['public']['Tables']['documents']['Update']
export type UpdatePropertyImage = Database['public']['Tables']['property_images']['Update']

// Classification result type
export interface ClassificationResult {
  document_type: 'rent_roll' | 'operating_statement' | 'offering_memorandum' | 'appraisal' | 'insurance' | 'lease_abstract' | 'other'
  confidence: number
  total_pages?: number
  // Detected segments within the document
  segments: DocumentSegment[]
  // For Excel files: detected sheets
  excel_sheets?: {
    name: string
    index: number
    type: 'rent_roll' | 'operating_statement' | 'other'
    period_info?: PeriodInfo
  }[] | null
}

// Detected segment within a document
export interface DocumentSegment {
  type: 'rent_roll' | 'operating_statement' | 'offering_memorandum' | 'appraisal' | 'insurance' | 'lease_abstract' | 'other'
  page_range: string  // e.g., "1-5", "10-15", "all"
  confidence: number
  period_info?: PeriodInfo
  // For Excel files
  sheet_index?: number
  sheet_name?: string
}

// Period/date information for a document
export interface PeriodInfo {
  // For rent rolls and point-in-time documents
  document_date?: string  // ISO date, e.g., "2024-12-15" (the "as of" date)
  // For T-12/Operating Statements with a period
  period_start?: string   // ISO date, e.g., "2024-01-01"
  period_end?: string     // ISO date, e.g., "2024-12-31"
  // Human-readable label
  period_label?: string   // e.g., "T-12 Jan-Dec 2024", "As of Dec 15, 2024"
}

// Property status type
export type PropertyStatus = 'processing' | 'active' | 'archived'

// Document type enum
export type DocumentType = 'rent_roll' | 'operating_statement' | 'offering_memorandum' | 'appraisal' | 'insurance' | 'lease_abstract' | 'other'

// OM Extraction types
export interface OMExtractionResult {
  property_info: OMPropertyInfo
  financial_info: OMFinancialInfo
  investment_info: OMInvestmentInfo
  returns_info: OMReturnsInfo
  pro_forma_projections: OMProFormaProjection[] | null
  sources_uses: OMSourcesUses | null
  images: OMImageInfo[]
}

export interface OMPropertyInfo {
  property_name: string | null
  property_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  property_type: string | null
  class_rating: string | null
  year_built: number | null
  year_renovated: number | null
  total_units: number | null
  avg_unit_size: number | null
  unit_mix_breakdown: OMUnitMix[] | null
  building_count: number | null
  stories: number | null
  amenity_list: string[] | null
  parking_ratio: number | null
  acreage: number | null
  owner: string | null
  manager: string | null
  occupancy_rate: number | null
  coordinates: { lat: number; lng: number } | null
}

export interface OMUnitMix {
  unit_type: string
  count: number
  avg_sqft: number | null
  avg_rent: number | null
  post_reno_rent: number | null
  percentage: number | null
}

export interface OMFinancialInfo {
  offer_price: number | null
  price_per_unit: number | null
  price_per_sf: number | null
  cap_rate: number | null
  noi: number | null
  effective_gross_income: number | null
  total_operating_expenses: number | null
  rent_growth_rate: number | null
  market_rent_psf: number | null
  market_rent_unit: number | null
  loan_amount: number | null
  interest_rate: number | null
  amortization: number | null
  loan_term: number | null
  ltv: number | null
  dscr: number | null
  expense_ratio: number | null
}

export interface OMReturnsInfo {
  irr: number | null
  cash_on_cash: number | null
  equity_multiple: number | null
  hold_period: string | null
  average_annual_return: number | null
}

export interface OMProFormaProjection {
  year: number
  year_label: string
  noi: number | null
  cash_flow: number | null
  property_value: number | null
}

export interface OMSourcesUses {
  sources: OMSourceUseItem[]
  uses: OMSourceUseItem[]
  total_sources: number | null
  total_uses: number | null
}

export interface OMSourceUseItem {
  item: string
  amount: number
  percentage: number | null
}

export interface OMInvestmentInfo {
  investment_highlights: string[] | null
  property_description: string | null
  investment_thesis: string | null
  submarket_description: string | null
  renovation_plan: string | null
  business_plan: string[] | null
  median_household_income: number | null
  population_growth_rate: number | null
  population_radius_1mi: number | null
  population_radius_3mi: number | null
  employment_growth_rate: number | null
  major_employers: string[] | null
}

export interface OMImageInfo {
  page_number: number
  image_index: number
  description: string | null
  estimated_category: 'exterior' | 'interior' | 'amenity' | 'aerial' | 'map' | 'floorplan' | 'other'
  estimated_subcategory: string | null
}

// Image analysis types
export interface ImageAnalysisResult {
  category: 'exterior' | 'interior' | 'amenity' | 'aerial' | 'map' | 'floorplan' | 'other'
  subcategory: string | null
  rating: number  // 1-10
  positives: string[]
  negatives: string[]
  description: string
}

export type ImageCategory = 'exterior' | 'interior' | 'amenity' | 'aerial' | 'map' | 'floorplan' | 'other'
