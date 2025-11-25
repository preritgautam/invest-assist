// app/documents/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Document {
  id: number;
  user_id: string;
  process_id: string;
  document_id: string;
  filename: string;
  document_type: string;
  file_size: string;
  file_path?: string;
  upload_status: string;
  extraction_status: string;
  extracted_data?: any;
  metadata?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface ApiResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentIds = params.id as string;
  const documentId = '878e830c-8995-4c84-9da9-aabc0d7139e9'


  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/documents/878e830c-8995-4c84-9da9-aabc0d7139e9`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.document) {
          setDocument(data.document);
        } else {
          throw new Error(data.error || 'Failed to fetch document');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching document:', err);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Document not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documents
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{document.filename}</h1>
      </div>

      {/* Document Details Card */}
      <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
        {/* Basic Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Document ID</p>
              <p className="font-mono text-sm mt-1">{document.document_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Process ID</p>
              <p className="font-mono text-sm mt-1">{document.process_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-mono text-sm mt-1">{document.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Internal ID</p>
              <p className="font-mono text-sm mt-1">{document.id}</p>
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">File Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Filename</p>
              <p className="font-medium mt-1">{document.filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Document Type</p>
              <p className="font-medium mt-1 capitalize">
                {document.document_type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">File Size</p>
              <p className="font-medium mt-1">
                {(parseInt(document.file_size) / 1024).toFixed(2)} KB
                <span className="text-gray-500 text-sm ml-2">
                  ({parseInt(document.file_size).toLocaleString()} bytes)
                </span>
              </p>
            </div>
            {document.file_path && (
              <div>
                <p className="text-sm text-gray-500">File Path</p>
                <p className="font-mono text-xs mt-1 break-all">{document.file_path}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Upload Status</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  document.upload_status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : document.upload_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {document.upload_status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Extraction Status</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  document.extraction_status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : document.extraction_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {document.extraction_status}
              </span>
            </div>
          </div>
          {document.error_message && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm font-medium text-red-800">Error Message</p>
              <p className="text-sm text-red-600 mt-1">{document.error_message}</p>
            </div>
          )}
        </div>

        {/* Extracted Data */}
        {document.extracted_data && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Extracted Data</h2>
            <div className="bg-gray-50 rounded p-4 overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(document.extracted_data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Metadata */}
        {document.metadata && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <div className="bg-gray-50 rounded p-4 overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(document.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium mt-1">
                {new Date(document.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated At</p>
              <p className="font-medium mt-1">
                {new Date(document.updated_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
          Download Document
        </button>
        <button className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium">
          View Extracted Data
        </button>
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium">
          Delete
        </button>
      </div>
    </div>
  );
}