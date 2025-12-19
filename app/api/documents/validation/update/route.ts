/**
 * API endpoint to update document validation status
 * POST /api/documents/validation
 * 
 * Body:
 * {
 *   propertyId: string,
 *   documentType: "OS" | "RR" | "OM",
 *   isValidated: boolean
 * }
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ValidationRequest {
  propertyId: string
  documentType: 'OS' | 'RR' | 'OM'
  isValidated: boolean
  userId?: string
}

export async function POST(request: Request) {
  try {
    const body: ValidationRequest = await request.json()
    const { propertyId, documentType, isValidated, userId } = body

    if (!propertyId || !documentType) {
      return Response.json(
        { error: 'propertyId and documentType are required' },
        { status: 400 }
      )
    }

    if (!['OS', 'RR', 'OM'].includes(documentType)) {
      return Response.json(
        { error: 'documentType must be OS, RR, or OM' },
        { status: 400 }
      )
    }

    // Upsert validation record - insert if doesn't exist, update if does
    const { data, error } = await supabase
      .from('document_validation')
      .upsert(
        {
          property_id: propertyId,
          document_type: documentType,
          is_validated: isValidated,
          validated_at: isValidated ? new Date().toISOString() : null,
          validated_by: userId || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'property_id,document_type',
        }
      )
      .select()

    if (error) {
      console.error('[Validation Update API] Error updating validation status:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log(
      '[Validation Update API] Updated validation status:',
      propertyId,
      documentType,
      isValidated
    )

    return Response.json({
      success: true,
      data: data?.[0],
    })
  } catch (error) {
    console.error('[Validation Update API] Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
