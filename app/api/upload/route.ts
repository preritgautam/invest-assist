import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Base upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Generate a unique filename to prevent conflicts
 */
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, ext)
  const uniqueId = uuidv4().slice(0, 8)
  return `${nameWithoutExt}-${uniqueId}${ext}`
}

/**
 * Sanitize filename to prevent directory traversal
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_')
}

/**
 * POST - Upload files
 */
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Get metadata if available
      const metadataStr = formData.get(`metadata_${i}`) as string | null
      const metadata = metadataStr ? JSON.parse(metadataStr) : {}

      // Validate file
      if (!file || !file.name) {
        continue
      }

      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 100MB limit` },
          { status: 400 }
        )
      }

      // Sanitize and generate unique filename
      const sanitizedName = sanitizeFilename(file.name)
      const uniqueFilename = generateUniqueFilename(sanitizedName)
      
      // Create subdirectory based on date (YYYY-MM-DD)
      const dateDir = new Date().toISOString().split('T')[0]
      const uploadPath = path.join(UPLOAD_DIR, dateDir)
      
      if (!existsSync(uploadPath)) {
        await mkdir(uploadPath, { recursive: true })
      }

      const filePath = path.join(uploadPath, uniqueFilename)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Store relative path for database/frontend
      const relativePath = path.join(dateDir, uniqueFilename)

      uploadedFiles.push({
        path: relativePath,
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        success: true,
        fromZip: metadata.fromZip || false,
        zipParent: metadata.zipParent || null,
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a file
 */
export async function DELETE(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Ensure the file path is within the upload directory (security check)
    const fullPath = path.join(UPLOAD_DIR, filePath)
    const normalizedPath = path.normalize(fullPath)
    
    if (!normalizedPath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!existsSync(normalizedPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete the file
    await unlink(normalizedPath)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve file information or download file
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Security check
    const fullPath = path.join(UPLOAD_DIR, filePath)
    const normalizedPath = path.normalize(fullPath)
    
    if (!normalizedPath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!existsSync(normalizedPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Read and return the file
    const { readFile } = await import('fs/promises')
    const fileBuffer = await readFile(normalizedPath)
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    })

  } catch (error) {
    console.error('File retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    )
  }
}
