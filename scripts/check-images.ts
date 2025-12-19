import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const PROPERTY_ID = '8aa59ee0-1457-4596-9d44-59124a0edcf6'

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Checking property_images for property:', PROPERTY_ID)

  const { data: images, error } = await supabase
    .from('property_images')
    .select('id, filename, storage_path, image_category, display_order, is_primary')
    .eq('property_id', PROPERTY_ID)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  const count = images ? images.length : 0
  console.log('Found ' + count + ' images:')
  if (images) {
    images.forEach((img, i) => {
      console.log('  ' + (i + 1) + '. [' + img.id + '] ' + img.filename + ' - ' + img.image_category + ' (primary: ' + img.is_primary + ')')
      console.log('     Path: ' + img.storage_path)
    })
  }

  // Test signed URL generation
  if (images && images.length > 0) {
    console.log('\nTesting signed URL generation for first image...')
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(images[0].storage_path, 3600)

    if (signError) {
      console.error('Signed URL error:', signError)
    } else if (signedUrlData && signedUrlData.signedUrl) {
      console.log('Signed URL works:', signedUrlData.signedUrl.substring(0, 100) + '...')
    }
  }
}

main().catch(console.error)
