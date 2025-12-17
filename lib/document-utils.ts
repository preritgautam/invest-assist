/**
 * Document utility functions for managing user-based document access
 */

export async function storeDocument(
  userId: string,
  processId: string,
  filename: string,
  documentType: string,
  fileSize: number = 0,
  documentId: string | null = null,
  propertyId: string | null = null
) {
  const response = await fetch('/api/documents/store', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      processId,
      documentId,
      filename,
      documentType,
      fileSize,
      propertyId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to store document: ${response.statusText}`);
  }

  return response.json();
}

export async function getUserDocuments(
  limit = 50,
  offset = 0,
  documentType?: string,
  uploadStatus?: string
) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (documentType) {
    params.append('documentType', documentType);
  }

  if (uploadStatus) {
    params.append('uploadStatus', uploadStatus);
  }

  const response = await fetch(`/api/documents/list?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }

  return response.json();
}

export async function getDocument(processId: string) {
  const response = await fetch(`/api/documents/${processId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }

  return response.json();
}

export async function updateDocumentStatus(
  processId: string,
  extractionStatus: string,
  extractionResult?: any,
  errorMessage?: string,
  documentId?: string
) {
  const response = await fetch('/api/documents/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      processId,
      extractionStatus,
      extractionResult,
      errorMessage,
      documentId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update document: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteDocument(processId: string) {
  // Soft delete by updating deleted_at timestamp
  const response = await fetch('/api/documents/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      processId,
      deleted_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete document: ${response.statusText}`);
  }

  return response.json();
}
