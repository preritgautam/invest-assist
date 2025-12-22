import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

// GET /api/properties/images?propertyId=xxx - Get all images for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId query parameter is required' },
        { status: 400 }
      )
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

    // Get property images
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
    console.error('[Property Images API] GET Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties/images - Create a property image record
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const {
      propertyId,
      filename,
      storagePath,
      imageCategory,
      imageSubcategory,
      displayOrder,
      isPrimary,
      documentId,
    } = body

    if (!propertyId || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, filename' },
        { status: 400 }
      )
    }

    // Verify property belongs to user's company
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // If isPrimary is true, unset any existing primary images for this property
    if (isPrimary) {
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId)
        .eq('company_id', companyId)
    }

    // Get current max display_order for this property
    let orderValue = displayOrder
    if (orderValue === undefined || orderValue === null) {
      const { data: maxOrder } = await supabase
        .from('property_images')
        .select('display_order')
        .eq('property_id', propertyId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      orderValue = (maxOrder?.display_order ?? -1) + 1
    }

    // Create property image record
    const { data: image, error: insertError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        company_id: companyId,
        document_id: documentId || null,
        filename,
        storage_path: storagePath || null,
        image_category: imageCategory || 'other',
        image_subcategory: imageSubcategory || null,
        display_order: orderValue,
        is_primary: isPrimary || false,
        is_thumbnail: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Property Images API] Insert error:', insertError)
      return NextResponse.json(
        { error: `Failed to create image record: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log('[Property Images API] Image record created:', image.id)

    return NextResponse.json({
      success: true,
      image,
    }, { status: 201 })

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
