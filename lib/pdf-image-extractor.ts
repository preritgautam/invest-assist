/**
 * PDF Image Extraction Utility
 *
 * Extracts images from PDF documents using pdf2pic (ImageMagick/Ghostscript).
 * This renders PDF pages as images, which works reliably in Node.js environments.
 */

import { fromBuffer } from 'pdf2pic'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'

export interface ExtractedImage {
  pageNumber: number
  imageIndex: number
  data: Buffer
  width: number
  height: number
  format: 'png' | 'jpeg'
  mimeType: string
}

export interface PageRenderResult {
  pageNumber: number
  data: Buffer
  width: number
  height: number
  format: 'png'
  mimeType: string
}

/**
 * Extract images from PDF pages using pdf2pic
 * This renders specific pages as high-quality images
 */
export async function extractImagesFromPDF(
  pdfBuffer: ArrayBuffer,
  options: {
    maxImages?: number
    minWidth?: number
    minHeight?: number
    pageNumbers?: number[]
  } = {}
): Promise<ExtractedImage[]> {
  const { maxImages = 50, pageNumbers } = options
  const extractedImages: ExtractedImage[] = []

  try {
    const buffer = Buffer.from(pdfBuffer)

    // Create a temporary directory for output
    const tempDir = path.join(os.tmpdir(), `pdf-extract-${Date.now()}`)
    fs.mkdirSync(tempDir, { recursive: true })

    const pdf2picOptions = {
      density: 150, // DPI - higher = better quality but slower
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png' as const,
      width: 1200,
      height: 1600,
    }

    const converter = fromBuffer(buffer, pdf2picOptions)

    // Get pages to extract - either specified pages or first 10 (typical for OM images)
    const pagesToExtract = pageNumbers || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    console.log(`[PDF Extractor] Extracting ${Math.min(pagesToExtract.length, maxImages)} pages`)

    for (const pageNum of pagesToExtract) {
      if (extractedImages.length >= maxImages) break

      try {
        const result = await converter(pageNum, { responseType: 'buffer' })

        if (result && result.buffer) {
          extractedImages.push({
            pageNumber: pageNum,
            imageIndex: extractedImages.length,
            data: result.buffer as Buffer,
            width: result.width || 1200,
            height: result.height || 1600,
            format: 'png',
            mimeType: 'image/png',
          })
          console.log(`[PDF Extractor] Extracted page ${pageNum}: ${result.width || 1200}x${result.height || 1600}`)
        }
      } catch (pageError: any) {
        // Page might not exist or other error - continue with next page
        console.warn(`[PDF Extractor] Failed to extract page ${pageNum}:`, pageError.message || pageError)
      }
    }

    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }

    console.log(`[PDF Extractor] Extracted ${extractedImages.length} images total`)
    return extractedImages
  } catch (error) {
    console.error('[PDF Extractor] Error extracting images:', error)
    throw error
  }
}

/**
 * Render PDF pages as images
 * This is an alias for extractImagesFromPDF with page-focused options
 */
export async function renderPDFPagesToImages(
  pdfBuffer: ArrayBuffer,
  options: {
    pageNumbers?: number[]
    scale?: number
    maxPages?: number
  } = {}
): Promise<PageRenderResult[]> {
  const { maxPages = 20, pageNumbers } = options

  // Convert scale to density (1x = 72dpi, 2x = 144dpi)
  const scale = options.scale || 2

  const buffer = Buffer.from(pdfBuffer)
  const renderedPages: PageRenderResult[] = []

  try {
    const tempDir = path.join(os.tmpdir(), `pdf-render-${Date.now()}`)
    fs.mkdirSync(tempDir, { recursive: true })

    const pdf2picOptions = {
      density: Math.round(72 * scale),
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png' as const,
      width: Math.round(612 * scale), // Letter width at 72dpi * scale
      height: Math.round(792 * scale), // Letter height at 72dpi * scale
    }

    const converter = fromBuffer(buffer, pdf2picOptions)

    // Generate page list if not provided
    const pagesToRender = pageNumbers || Array.from({ length: maxPages }, (_, i) => i + 1)

    console.log(`[PDF Renderer] Rendering up to ${pagesToRender.length} pages`)

    for (const pageNum of pagesToRender) {
      if (renderedPages.length >= maxPages) break

      try {
        const result = await converter(pageNum, { responseType: 'buffer' })

        if (result && result.buffer) {
          renderedPages.push({
            pageNumber: pageNum,
            data: result.buffer as Buffer,
            width: result.width || pdf2picOptions.width,
            height: result.height || pdf2picOptions.height,
            format: 'png',
            mimeType: 'image/png',
          })
          console.log(`[PDF Renderer] Rendered page ${pageNum}: ${result.width}x${result.height}`)
        }
      } catch (pageError: any) {
        // Page might not exist - stop trying more pages
        console.log(`[PDF Renderer] Page ${pageNum} not available, stopping`)
        break
      }
    }

    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }

    return renderedPages
  } catch (error) {
    console.error('[PDF Renderer] Error rendering pages:', error)
    throw error
  }
}

/**
 * Detect which pages likely contain property images
 * Based on common OM layout patterns
 */
export function getImagePageHints(totalPages: number): number[] {
  const pages: number[] = []

  // Cover page usually has hero image
  pages.push(1)

  // First few pages often have property photos
  for (let i = 2; i <= Math.min(5, totalPages); i++) {
    pages.push(i)
  }

  // Pages around 10-15 often have interior/amenity photos
  for (let i = 10; i <= Math.min(15, totalPages); i++) {
    if (!pages.includes(i)) pages.push(i)
  }

  // Last few pages sometimes have aerial views
  for (let i = Math.max(totalPages - 3, 1); i <= totalPages; i++) {
    if (!pages.includes(i)) pages.push(i)
  }

  return pages.sort((a, b) => a - b)
}
