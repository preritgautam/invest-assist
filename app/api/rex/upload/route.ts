// app/api/rex/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    
    // Extract files and options
    const files = formData.getAll('files');
    const documentType = formData.get('documentType') as string;
    const clientReference = formData.get('clientReference') as string | null;
    const pageRange = formData.get('pageRange') as string;
    const sheetIndex = formData.get('sheetIndex') as string | null;
    const templateId = formData.get('templateId') as string;
    const templateName = formData.get('templateName') as string;

    // Validate required fields
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!documentType || !templateId || !templateName) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType, templateId, or templateName' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.DOCIN_API_KEY;
    if (!apiKey) {
      console.error('DOCIN_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create FormData for REX API
    const rexFormData = new FormData();

    // Add files to REX formData
    for (const file of files) {
      if (file instanceof File) {
        rexFormData.append('file', file);
      }
    }

    // Add other parameters
    rexFormData.append('documentType', documentType);
    if (clientReference) {
      rexFormData.append('clientReference', clientReference);
    }
    // Pass pageRange to REX API - it supports extracting specific pages
    rexFormData.append('pageRange', pageRange || 'all');
    if (sheetIndex) {
      rexFormData.append('sheetIndex', sheetIndex);
    }
    rexFormData.append('templateId', templateId);
    rexFormData.append('templateName', templateName);

    console.log(`[REX API] Uploading ${files.length} file(s) to REX with pageRange: ${pageRange || 'all'}`);

    // Forward to REX API
    const response = await fetch('https://dev-try.docin.ai/api/v1/rex/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: rexFormData,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('[REX API] Error response:', errorData);
        return NextResponse.json(
          { error: errorData.error || `REX API error: ${response.status}` },
          { status: response.status }
        );
      } else {
        const errorText = await response.text();
        console.error('[REX API] Error response (non-JSON):', errorText.substring(0, 200));
        return NextResponse.json(
          { error: `REX API returned non-JSON response (${response.status}). Check DOCIN_API_KEY configuration.` },
          { status: response.status }
        );
      }
    }

    // Verify response is JSON before parsing
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('[REX API] Upload returned non-JSON despite 200 OK:', responseText.substring(0, 200));
      return NextResponse.json(
        { error: 'REX API returned non-JSON response. The API key may be invalid or the service is unavailable.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log('[REX API] Upload successful:', data);

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[REX API] Server error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Export runtime config for Next.js 15
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
