// lib/file-upload-utils.ts
import JSZip from 'jszip';

export interface ExtractedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface UploadResponse {
  path: string;
  filename: string;
  size: number;
  success: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  selected: boolean;
  file: File;
  fromZip?: boolean;
  zipParent?: string;
  localPath?: string;
  documentId?: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

/**
 * Extract files from a zip archive
 * @param zipFile - The zip file to extract
 * @returns Array of extracted files
 */
export async function extractZipFile(zipFile: File): Promise<ExtractedFile[]> {
  try {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile);
    const extractedFiles: ExtractedFile[] = [];

    // Iterate through all files in the zip
    for (const [relativePath, zipEntry] of Object.entries(zipData.files)) {
      // Skip directories and hidden files
      if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) {
        continue;
      }

      // Get the file blob
      const blob = await zipEntry.async('blob');
      
      // Get file name (last part of path)
      const fileName = relativePath.split('/').pop() || relativePath;
      
      // Determine MIME type based on extension
      const extension = fileName.split('.').pop()?.toLowerCase();
      const mimeType = getMimeType(extension || '');

      // Create a File object from the blob
      const file = new File([blob], fileName, { type: mimeType });

      extractedFiles.push({
        name: fileName,
        size: file.size,
        type: mimeType,
        file: file,
      });
    }

    return extractedFiles;
  } catch (error) {
    console.error('Error extracting zip file:', error);
    throw new Error('Failed to extract zip file');
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
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Upload files to the API endpoint
 * This function uploads files one by one to the Docin.ai API
 */
export async function uploadFilesToAPI(
  files: UploadedFile[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
): Promise<void> {
  console.log(`Starting upload for ${files.length} files`);

  // Upload files one by one
  for (const fileData of files) {
    try {
      console.log(`Uploading file: ${fileData.name} (${fileData.size} bytes, type: ${fileData.file.type})`);
      console.log('File object:', fileData.file);
      console.log('File instanceof File:', fileData.file instanceof File);
      console.log('File instanceof Blob:', fileData.file instanceof Blob);
      
      // Verify the file is valid
      if (!fileData.file || !(fileData.file instanceof File)) {
        throw new Error('Invalid file object');
      }

      if (fileData.file.size === 0) {
        throw new Error('File is empty');
      }
      
      // Update status to uploading
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, uploadStatus: 'uploading' } : f
        )
      );

      // Create FormData with the file
      const formData = new FormData();
      
      // Append the file - try without the third parameter first
      formData.append('file', fileData.file);
      
      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }

      console.log('Sending request to /api/upload...');

      // Upload to API
      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with the boundary
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Upload failed:', data);
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload successful:', data);

      // Update status to success
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                uploadStatus: 'success',
                documentId: data.documentId,
                localPath: data.documentId,
              }
            : f
        )
      );
    } catch (error) {
      console.error(`Error uploading file ${fileData.name}:`, error);
      
      // Update status to error
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                uploadStatus: 'error',
                uploadError: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
    }
  }
  
  console.log('All uploads completed');
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
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}