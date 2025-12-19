/**
 * API endpoint to get document validation status for a property
 * GET /api/documents/validation?propertyId=<propertyId>
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return Response.json({ error: 'propertyId is required' }, { status: 400 })
    }

    // Fetch validation status for all document types
    const { data, error } = await supabase
      .from('document_validation')
      .select('*')
      .eq('property_id', propertyId)

    if (error) {
      console.error('[Validation API] Error fetching validation status:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Format response with validation status keyed by document type
    const validationStatus = {
      OS: false,
      RR: false,
      OM: false,
    }

    if (data && data.length > 0) {
      data.forEach((record: any) => {
        validationStatus[record.document_type as keyof typeof validationStatus] = record.is_validated
      })
    }

    console.log('[Validation API] Fetched validation status for property:', propertyId, validationStatus)

    return Response.json({
      success: true,
      validationStatus,
      records: data,
    })
  } catch (error) {
    console.error('[Validation API] Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
