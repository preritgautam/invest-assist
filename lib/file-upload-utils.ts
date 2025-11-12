import JSZip from 'jszip'

export interface ExtractedFile {
  name: string
  size: number
  type: string
  file: File
}

export interface UploadResponse {
  path: string
  filename: string
  size: number
  success: boolean
}

/**
 * Extract files from a zip archive
 * @param zipFile - The zip file to extract
 * @returns Array of extracted files
 */
export async function extractZipFile(zipFile: File): Promise<ExtractedFile[]> {
  try {
    const zip = new JSZip()
    const zipData = await zip.loadAsync(zipFile)
    const extractedFiles: ExtractedFile[] = []

    // Iterate through all files in the zip
    for (const [relativePath, zipEntry] of Object.entries(zipData.files)) {
      // Skip directories and hidden files
      if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) {
        continue
      }

      // Get the file blob
      const blob = await zipEntry.async('blob')
      
      // Get file name (last part of path)
      const fileName = relativePath.split('/').pop() || relativePath
      
      // Determine MIME type based on extension
      const extension = fileName.split('.').pop()?.toLowerCase()
      const mimeType = getMimeType(extension || '')

      // Create a File object from the blob
      const file = new File([blob], fileName, { type: mimeType })

      extractedFiles.push({
        name: fileName,
        size: file.size,
        type: mimeType,
        file: file,
      })
    }

    return extractedFiles
  } catch (error) {
    console.error('Error extracting zip file:', error)
    throw new Error('Failed to extract zip file')
  }
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    txt: 'text/plain',
    csv: 'text/csv',
  }

  return mimeTypes[extension] || 'application/octet-stream'
}

/**
 * Upload files to the server
 * @param files - Array of files to upload
 * @returns Array of upload responses with file paths
 */
export async function uploadFiles(files: { name: string; file: File; fromZip?: boolean; zipParent?: string }[]): Promise<UploadResponse[]> {
  try {
    const formData = new FormData()

    // Add each file to the form data
    files.forEach((fileData, index) => {
      formData.append(`files`, fileData.file)
      formData.append(`metadata_${index}`, JSON.stringify({
        originalName: fileData.name,
        fromZip: fileData.fromZip || false,
        zipParent: fileData.zipParent || null,
      }))
    })

    // Send to upload API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result.files
  } catch (error) {
    console.error('Error uploading files:', error)
    throw new Error('Failed to upload files')
  }
}

/**
 * Delete a file from storage
 * @param filePath - Path of the file to delete
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    })

    if (!response.ok) {
      throw new Error('Delete failed')
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}
