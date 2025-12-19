import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ImageAnalysisResult, OMImageInfo, NewPropertyImage } from '@/lib/supabase/database.types'
import { PDFDocument } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { extractImagesFromPDF, renderPDFPagesToImages, getImagePageHints, ExtractedImage } from '@/lib/pdf-image-extractor'

const BUCKET_NAME = 'documents'
// Images are stored in {companyId}/{propertyId}/images/ to match RLS policy
// (RLS requires path to start with company_id)

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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

// Image Analysis Prompt
const IMAGE_ANALYSIS_PROMPT = `You are an expert commercial real estate property analyst. Analyze this property image and provide a detailed assessment.

## Classify the image into one of these categories:
- exterior: Building exterior, facade, front view, parking lot, entrance
- interior: Unit interior, apartment/office interior, common area interior
- amenity: Pool, gym, clubhouse, playground, dog park, BBQ area, business center
- aerial: Drone shot, aerial view, bird's eye view
- map: Location map, site plan, area map
- floorplan: Floor plan, unit layout, building layout
- other: Renderings, charts, logos, other non-photo content

## Provide a subcategory for more detail:
For exterior: "front", "rear", "side", "entrance", "parking", "landscaping", "signage"
For interior: "living_room", "bedroom", "bathroom", "kitchen", "dining", "closet", "laundry"
For amenity: "pool", "gym", "clubhouse", "playground", "dog_park", "business_center", "courtyard"

## Rate the image on a scale of 1-10:
Consider: property condition, curb appeal, maintenance quality, age appearance, desirability

## Identify POSITIVES (things that look good):
- Modern finishes, updated appliances, good lighting
- Well-maintained landscaping, clean appearance
- Attractive amenities, nice views
- Quality materials, spacious layout

## Identify NEGATIVES (potential concerns):
- Dated finishes, worn carpet, old appliances
- Deferred maintenance, peeling paint, damaged items
- Poor lighting, small spaces
- Safety concerns, accessibility issues

## Response Format (JSON):
{
  "category": "exterior" | "interior" | "amenity" | "aerial" | "map" | "floorplan" | "other",
  "subcategory": string | null,
  "rating": number (1-10),
  "positives": string[] (list of positive observations),
  "negatives": string[] (list of concerns or negative observations),
  "description": string (brief description of what the image shows)
}

## Important:
- Be objective and honest in your assessment
- Focus on property investment relevance
- List specific, actionable observations
- A rating of 5 is average, 7+ is good, 3- is concerning
- Return ONLY valid JSON, no markdown code blocks`

// POST /api/documents/om-images - Extract and analyze images from an OM
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
    const { documentId, propertyId, imageInfos } = body as {
      documentId: number
      propertyId: string
      imageInfos?: OMImageInfo[]  // Optional - from OM extraction result
    }

    if (!documentId || !propertyId) {
      return NextResponse.json(
        { error: 'Document ID and Property ID are required' },
        { status: 400 }
      )
    }

    // Get document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify document belongs to user's company
    if (document.company_id !== companyId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Verify property exists and belongs to user's company
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    console.log('[OM Images API] Processing document:', documentId, 'for property:', propertyId)

    // Check storage path exists
    if (!document.storage_path) {
      return NextResponse.json(
        { error: 'Document has no storage path' },
        { status: 400 }
      )
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(document.storage_path)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: `Failed to download file: ${downloadError?.message}` },
        { status: 500 }
      )
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const filename = document.filename.toLowerCase()

    // For PDFs, we'll extract actual images and analyze them
    if (!filename.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF documents are supported for image extraction' },
        { status: 400 }
      )
    }

    // Get page count
    let pageCount = 1
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      pageCount = pdfDoc.getPageCount()
    } catch (e) {
      console.error('[OM Images API] Failed to get PDF page count:', e)
    }

    console.log('[OM Images API] PDF has', pageCount, 'pages')

    // STEP 1: Extract actual images from the PDF
    console.log('[OM Images API] Extracting images from PDF...')
    let extractedImages: ExtractedImage[] = []

    try {
      // First try to extract embedded images directly
      extractedImages = await extractImagesFromPDF(arrayBuffer, {
        maxImages: 30,
        minWidth: 200,
        minHeight: 200,
      })
      console.log('[OM Images API] Extracted', extractedImages.length, 'embedded images')

      // If we didn't find many embedded images, also render key pages
      if (extractedImages.length < 5) {
        console.log('[OM Images API] Few embedded images found, rendering key pages...')
        const pageHints = getImagePageHints(pageCount)
        const renderedPages = await renderPDFPagesToImages(arrayBuffer, {
          pageNumbers: pageHints.slice(0, 10), // Limit to 10 pages
          scale: 1.5,
        })

        // Convert rendered pages to extracted image format
        for (const page of renderedPages) {
          extractedImages.push({
            pageNumber: page.pageNumber,
            imageIndex: 0,
            data: page.data,
            width: page.width,
            height: page.height,
            format: 'png',
            mimeType: 'image/png',
          })
        }
        console.log('[OM Images API] Added', renderedPages.length, 'rendered pages')
      }
    } catch (extractError) {
      console.error('[OM Images API] Failed to extract images:', extractError)
      // Fall back to rendering pages if extraction fails
      try {
        const pageHints = getImagePageHints(pageCount)
        const renderedPages = await renderPDFPagesToImages(arrayBuffer, {
          pageNumbers: pageHints.slice(0, 15),
          scale: 1.5,
        })
        extractedImages = renderedPages.map(page => ({
          pageNumber: page.pageNumber,
          imageIndex: 0,
          data: page.data,
          width: page.width,
          height: page.height,
          format: 'png',
          mimeType: 'image/png',
        }))
        console.log('[OM Images API] Fallback: Rendered', extractedImages.length, 'pages')
      } catch (renderError) {
        console.error('[OM Images API] Failed to render pages:', renderError)
      }
    }

    if (extractedImages.length === 0) {
      return NextResponse.json({
        success: true,
        images: [],
        totalFound: 0,
        documentId,
        propertyId,
        message: 'No images could be extracted from the PDF',
      }, { status: 200 })
    }

    // STEP 2: Upload extracted images to Supabase storage
    console.log('[OM Images API] Uploading', extractedImages.length, 'images to storage...')
    const uploadedImages: Array<{
      extractedImage: ExtractedImage
      storagePath: string
      imageId: string
    }> = []

    for (let i = 0; i < extractedImages.length; i++) {
      const img = extractedImages[i]
      const imageId = uuidv4()
      // Store images in {companyId}/{propertyId}/images/ folder to match RLS policy
      const storagePath = `${companyId}/${propertyId}/images/${imageId}.png`

      try {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, img.data, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error(`[OM Images API] Failed to upload image ${i + 1}:`, uploadError)
          continue
        }

        uploadedImages.push({
          extractedImage: img,
          storagePath,
          imageId,
        })
        console.log(`[OM Images API] Uploaded image ${i + 1}: ${storagePath}`)
      } catch (uploadErr) {
        console.error(`[OM Images API] Error uploading image ${i + 1}:`, uploadErr)
      }
    }

    console.log('[OM Images API] Successfully uploaded', uploadedImages.length, 'images')

    // STEP 3: Analyze images with Gemini (batch analysis)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const analyzedImages: Array<NewPropertyImage & { analysis: ImageAnalysisResult }> = []

    // Analyze each uploaded image individually for better accuracy
    for (let i = 0; i < uploadedImages.length; i++) {
      const { extractedImage, storagePath, imageId } = uploadedImages[i]

      let analysis: ImageAnalysisResult = {
        category: 'other',
        subcategory: null,
        rating: 5,
        positives: [],
        negatives: [],
        description: `Image from page ${extractedImage.pageNumber}`,
      }

      try {
        // Ensure we have a proper Buffer and convert to base64
        const imageBuffer = Buffer.isBuffer(extractedImage.data)
          ? extractedImage.data
          : Buffer.from(extractedImage.data)

        // Check if image is too large (> 4MB after base64 encoding)
        const base64Image = imageBuffer.toString('base64')
        const estimatedSize = base64Image.length * 0.75 // base64 is ~33% larger

        if (estimatedSize > 4 * 1024 * 1024) {
          console.warn(`[OM Images API] Image ${i + 1} is too large (${(estimatedSize / 1024 / 1024).toFixed(2)}MB), skipping AI analysis`)
          // Skip analysis for large images but still save them
        } else {
          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Image,
              },
            },
            { text: IMAGE_ANALYSIS_PROMPT },
          ])

          const response = result.response
          const text = response.text()

          // Parse the response
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            analysis = {
              category: parsed.category || 'other',
              subcategory: parsed.subcategory || null,
              rating: typeof parsed.rating === 'number' ? parsed.rating : 5,
              positives: Array.isArray(parsed.positives) ? parsed.positives : [],
              negatives: Array.isArray(parsed.negatives) ? parsed.negatives : [],
              description: parsed.description || `Image from page ${extractedImage.pageNumber}`,
            }
          }
        }
      } catch (analysisError) {
        console.warn(`[OM Images API] Failed to analyze image ${i + 1}:`, analysisError)
      }

      // Create property_image record
      const propertyImage: NewPropertyImage & { analysis: ImageAnalysisResult } = {
        property_id: propertyId,
        company_id: companyId,
        document_id: documentId,
        filename: `property_image_${i + 1}.png`,
        storage_path: storagePath,
        source_page: extractedImage.pageNumber,
        image_category: analysis.category,
        image_subcategory: analysis.subcategory,
        ai_rating: analysis.rating,
        ai_positives: analysis.positives.length > 0 ? analysis.positives : null,
        ai_negatives: analysis.negatives.length > 0 ? analysis.negatives : null,
        ai_description: analysis.description,
        ai_analysis: analysis,
        display_order: i,
        is_primary: i === 0,
        is_thumbnail: i === 0,
        analysis,
      }

      analyzedImages.push(propertyImage)
    }

    // STEP 4: Insert property_images records into database
    console.log('[OM Images API] Inserting', analyzedImages.length, 'records into database...')
    const insertedImages: any[] = []

    for (const img of analyzedImages) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { analysis, ...imageRecord } = img

      const { data: insertedImage, error: insertError } = await supabase
        .from('property_images')
        .insert(imageRecord)
        .select()
        .single()

      if (insertError) {
        console.error('[OM Images API] Failed to insert property image:', insertError)
      } else {
        insertedImages.push(insertedImage)
      }
    }

    // STEP 5: Update property thumbnail if we found images
    if (insertedImages.length > 0) {
      // Find the best image for thumbnail (highest rated exterior or first image)
      const exteriorImages = insertedImages.filter(img => img.image_category === 'exterior')
      const bestImage = exteriorImages.length > 0
        ? exteriorImages.sort((a, b) => (b.ai_rating || 0) - (a.ai_rating || 0))[0]
        : insertedImages[0]

      if (bestImage) {
        // Generate a signed URL for the thumbnail
        const { data: signedUrlData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(bestImage.storage_path, 60 * 60 * 24 * 7) // 7 day expiry

        const thumbnailUrl = signedUrlData?.signedUrl || `/api/properties/${propertyId}/images/${bestImage.id}`

        await supabase
          .from('properties')
          .update({
            thumbnail_url: thumbnailUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', propertyId)
          .eq('company_id', companyId)

        // Mark the best image as primary and thumbnail
        await supabase
          .from('property_images')
          .update({ is_primary: false, is_thumbnail: false })
          .eq('property_id', propertyId)
          .neq('id', bestImage.id)

        await supabase
          .from('property_images')
          .update({ is_primary: true, is_thumbnail: true })
          .eq('id', bestImage.id)
      }
    }

    console.log('[OM Images API] Successfully processed', insertedImages.length, 'property images')

    return NextResponse.json({
      success: true,
      images: insertedImages,
      totalExtracted: extractedImages.length,
      totalUploaded: uploadedImages.length,
      totalAnalyzed: analyzedImages.length,
      totalInserted: insertedImages.length,
      documentId,
      propertyId,
    }, { status: 200 })

  } catch (error) {
    console.error('[OM Images API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}


// GET /api/documents/om-images - Get property images for a property
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Get property images
    const { data: images, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[OM Images API] Error fetching images:', error)
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      images: images || [],
      propertyId,
    }, { status: 200 })

  } catch (error) {
    console.error('[OM Images API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
