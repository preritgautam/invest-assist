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
    files.forEach((file) => {
      if (file instanceof File) {
        rexFormData.append('file', file);
      }
    });

    // Add other parameters
    rexFormData.append('documentType', documentType);
    if (clientReference) {
      rexFormData.append('clientReference', clientReference);
    }
    rexFormData.append('pageRange', pageRange || 'all');
    if (sheetIndex) {
      rexFormData.append('sheetIndex', sheetIndex);
    }
    rexFormData.append('templateId', templateId);
    rexFormData.append('templateName', templateName);

    console.log(`[REX API] Uploading ${files.length} file(s) to REX...`);

    // Forward to REX API
    const response = await fetch('https://dev-try.docin.ai/api/v1/rex/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: rexFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[REX API] Error response:', errorText);
      return NextResponse.json(
        { error: `REX API error: ${errorText}` },
        { status: response.status }
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
