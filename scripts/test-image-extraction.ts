/**
 * Test script for image extraction
 * This script extracts images from an existing OM PDF WITHOUT calling LLM for classification
 *
 * Usage: npx tsx scripts/test-image-extraction.ts
 */

import { createClient } from '@supabase/supabase-js'
import { fromBuffer } from 'pdf2pic'
import { v4 as uuidv4 } from 'uuid'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const PROPERTY_ID = '8aa59ee0-1457-4596-9d44-59124a0edcf6'
const BUCKET_NAME = 'documents'
// Images stored in {companyId}/{propertyId}/images/ to match RLS policy

interface ExtractedPage {
  pageNumber: number
  buffer: Buffer
  width: number
  height: number
}

async function extractPagesFromPDF(pdfBuffer: Buffer, pageNumbers: number[]): Promise<ExtractedPage[]> {
  const results: ExtractedPage[] = []

  const options = {
    density: 150,
    saveFilename: 'page',
    savePath: os.tmpdir(),
    format: 'png',
    width: 1200,
    height: 1600,
  }

  const converter = fromBuffer(pdfBuffer, options)

  for (const pageNum of pageNumbers) {
    try {
      const result = await converter(pageNum, { responseType: 'buffer' })
      if (result && result.buffer) {
        results.push({
          pageNumber: pageNum,
          buffer: result.buffer as Buffer,
          width: result.width || 1200,
          height: result.height || 1600,
        })
        console.log(`   Converted page ${pageNum}`)
      }
    } catch (e: any) {
      console.log(`   Failed to convert page ${pageNum}: ${e.message}`)
    }
  }

  return results
}

async function main() {
  console.log('=== Image Extraction Test (pdf2pic) ===\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Get property info
  console.log('1. Fetching property info...')
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', PROPERTY_ID)
    .single()

  if (propError || !property) {
    console.error('Property not found:', propError)
    process.exit(1)
  }

  console.log(`   Property: ${property.name}`)
  console.log(`   Company ID: ${property.company_id}`)
  console.log('')

  // 2. Get documents for this property
  console.log('2. Fetching documents...')
  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('id, filename, document_type, storage_path, classification_status')
    .eq('property_id', PROPERTY_ID)
    .order('created_at', { ascending: false })

  if (docsError) {
    console.error('Error fetching documents:', docsError)
    process.exit(1)
  }

  console.log(`   Found ${documents?.length || 0} documents:`)
  documents?.forEach(doc => {
    console.log(`   - [${doc.id}] ${doc.filename} (${doc.document_type || 'unknown'})`)
  })
  console.log('')

  // 3. Find the OM document
  const omDocument = documents?.find(d => d.document_type === 'offering_memorandum')
  const targetDoc = omDocument || documents?.find(d => d.filename?.toLowerCase().endsWith('.pdf'))

  if (!targetDoc || !targetDoc.storage_path) {
    console.error('No suitable document found')
    process.exit(1)
  }

  console.log(`3. Using document: ${targetDoc.filename} (ID: ${targetDoc.id})`)
  console.log('')

  // 4. Check/clear existing property_images
  console.log('4. Checking existing property images...')
  const { data: existingImages } = await supabase
    .from('property_images')
    .select('id')
    .eq('property_id', PROPERTY_ID)

  if (existingImages && existingImages.length > 0) {
    console.log(`   Found ${existingImages.length} existing images, deleting...`)
    await supabase
      .from('property_images')
      .delete()
      .eq('property_id', PROPERTY_ID)
    console.log('   Deleted.')
  } else {
    console.log('   No existing images.')
  }
  console.log('')

  // 5. Download the PDF
  console.log('5. Downloading PDF from storage...')
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(BUCKET_NAME)
    .download(targetDoc.storage_path)

  if (downloadError || !fileData) {
    console.error('Failed to download:', downloadError)
    process.exit(1)
  }

  const arrayBuffer = await fileData.arrayBuffer()
  const pdfBuffer = Buffer.from(arrayBuffer)
  console.log(`   Downloaded ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`)
  console.log('')

  // 6. Extract pages as images
  console.log('6. Converting PDF pages to images...')

  // For OMs, first 10-15 pages usually have property photos
  const pagesToExtract = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const extractedPages = await extractPagesFromPDF(pdfBuffer, pagesToExtract)
  console.log(`   Extracted ${extractedPages.length} pages`)
  console.log('')

  if (extractedPages.length === 0) {
    console.log('No pages extracted. Make sure ImageMagick/Ghostscript is installed.')
    process.exit(1)
  }

  // 7. Upload to storage
  console.log('7. Uploading images to storage...')
  const uploadedImages: any[] = []

  for (const page of extractedPages) {
    const imageId = uuidv4()
    // Use {companyId}/{propertyId}/images/ path to match RLS policy
    const storagePath = `${property.company_id}/${PROPERTY_ID}/images/${imageId}.png`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, page.buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.log(`   Page ${page.pageNumber}: Upload failed - ${uploadError.message}`)
      continue
    }

    uploadedImages.push({
      imageId,
      storagePath,
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
    })
    console.log(`   Page ${page.pageNumber}: Uploaded`)
  }

  console.log(`   Total uploaded: ${uploadedImages.length}`)
  console.log('')

  // 8. Insert into property_images
  console.log('8. Inserting image records...')
  const insertedImages: any[] = []

  for (let i = 0; i < uploadedImages.length; i++) {
    const img = uploadedImages[i]

    const record = {
      property_id: PROPERTY_ID,
      company_id: property.company_id,
      document_id: targetDoc.id,
      filename: `page_${img.pageNumber}.png`,
      storage_path: img.storagePath,
      source_page: img.pageNumber,
      image_category: img.pageNumber === 1 ? 'exterior' : 'other',
      ai_rating: 7,
      ai_description: `Page ${img.pageNumber} from OM`,
      display_order: i,
      is_primary: i === 0,
      is_thumbnail: i === 0,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('property_images')
      .insert(record)
      .select()
      .single()

    if (insertError) {
      console.log(`   Page ${img.pageNumber}: Insert failed - ${insertError.message}`)
    } else {
      insertedImages.push(inserted)
      console.log(`   Page ${img.pageNumber}: Inserted (ID: ${inserted.id})`)
    }
  }

  console.log(`   Total inserted: ${insertedImages.length}`)
  console.log('')

  // 9. Update property thumbnail
  if (insertedImages.length > 0) {
    console.log('9. Updating property thumbnail...')
    const primaryImage = insertedImages[0]

    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(primaryImage.storage_path, 60 * 60 * 24 * 7) // 7 days

    if (signedUrlData?.signedUrl) {
      await supabase
        .from('properties')
        .update({ thumbnail_url: signedUrlData.signedUrl })
        .eq('id', PROPERTY_ID)

      console.log('   Thumbnail updated!')
    }
  }

  console.log('\n=== Done! ===')
  console.log(`\nVisit: http://localhost:3000/properties/${PROPERTY_ID}/property`)
}

main().catch(console.error)
