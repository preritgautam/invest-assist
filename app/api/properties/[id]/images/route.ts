import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Helper to get user's company_id
async function getUserCompanyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: userData, error } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single()

  if (error || !userData?.company_id) {
    return null
  }
  return userData.company_id
}

// GET /api/properties/[id]/images - Get all images for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    // Validate UUID format to handle mock data gracefully
    if (!isValidUUID(propertyId)) {
      console.log(`[Property Images API] Non-UUID propertyId: ${propertyId} (likely mock data)`)
      return NextResponse.json({
        success: true,
        images: [],
        propertyId,
        message: 'Mock property - no images in database',
      }, { status: 200 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = await getUserCompanyId(supabase, user.id)

    if (!companyId) {
      return NextResponse.json(
        { error: 'User has no company' },
        { status: 403 }
      )
    }

    // Verify property belongs to user's company
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get property images with AI analysis
    const { data: images, error: imagesError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .order('display_order', { ascending: true })

    if (imagesError) {
      console.error('[Property Images API] Error fetching images:', imagesError)
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      )
    }

    // Generate signed URLs for each image
    const imagesWithUrls = await Promise.all(
      (images || []).map(async (image) => {
        if (image.storage_path) {
          const { data: signedUrlData } = await supabase.storage
            .from('documents')
            .createSignedUrl(image.storage_path, 3600) // 1 hour expiry

          return {
            ...image,
            signed_url: signedUrlData?.signedUrl || null,
          }
        }
        return { ...image, signed_url: null }
      })
    )

    return NextResponse.json({
      success: true,
      propertyId,
      propertyName: property.name,
      images: imagesWithUrls,
      totalImages: imagesWithUrls.length,
    }, { status: 200 })

  } catch (error) {
    console.error('[Property Images API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
