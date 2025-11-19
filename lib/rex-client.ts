// lib/rex-client.ts
// Client-side utilities to call REX API routes

interface RexUploadResponse {
  processId: string;
  status: string;
  documentId: string;
  estimatedCompletionTime: string;
  statusUrl: string;
  resultUrl: string;
}

interface RexUploadOptions {
  documentType: string;
  clientReference?: string;
  pageRange?: string;
  sheetIndex?: string;
  templateId: string;
  templateName: string;
}

/**
 * Upload files to REX via API route
 */
export async function uploadFilesToRex(
  files: File[],
  options: RexUploadOptions
): Promise<RexUploadResponse> {
  try {
    // Create FormData
    const formData = new FormData();

    // Add files
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Add options
    formData.append('documentType', options.documentType);
    if (options.clientReference) {
      formData.append('clientReference', options.clientReference);
    }
    formData.append('pageRange', options.pageRange || 'all');
    if (options.sheetIndex) {
      formData.append('sheetIndex', options.sheetIndex);
    }
    formData.append('templateId', options.templateId);
    formData.append('templateName', options.templateName);

    console.log(`[REX Client] Uploading ${files.length} file(s)...`);

    // Call our API route
    const response = await fetch('/api/rex/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const data: RexUploadResponse = await response.json();
    console.log('[REX Client] Upload successful:', data);
    
    return data;

  } catch (error) {
    console.error('[REX Client] Upload error:', error);
    throw error;
  }
}

/**
 * Check the status of a REX process
 */
export async function checkRexProcessStatus(processId: string): Promise<any> {
  try {
    console.log(`[REX Client] Checking status for: ${processId}`);

    const response = await fetch(`/api/rex/status/${processId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Status check failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[REX Client] Status retrieved:', data);
    
    return data;

  } catch (error) {
    console.error('[REX Client] Status check error:', error);
    throw error;
  }
}

/**
 * Get the result of a completed REX process
 */
export async function getRexProcessResult(processId: string): Promise<any> {
  try {
    console.log(`[REX Client] Fetching result for: ${processId}`);

    const response = await fetch(`/api/rex/result/${processId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Result fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[REX Client] Result retrieved successfully');
    
    return data;

  } catch (error) {
    console.error('[REX Client] Result fetch error:', error);
    throw error;
  }
}