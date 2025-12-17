import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const processId = request.nextUrl.searchParams.get('processId');

    if (!processId) {
      return NextResponse.json(
        { error: 'processId query parameter is required' },
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

    console.log(`[REX API] Checking status for process: ${processId}`);

    // Call REX API status endpoint
    const response = await fetch(
      `https://dev-try.docin.ai/api/v1/rex/status/${processId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('[REX API] Status check error:', errorData);
        return NextResponse.json(
          { error: errorData.error || `REX API error: ${response.status}` },
          { status: response.status }
        );
      } else {
        const errorText = await response.text();
        console.error('[REX API] Status check error (non-JSON):', errorText.substring(0, 200));
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
      console.error('[REX API] Status check returned non-JSON despite 200 OK:', responseText.substring(0, 200));
      return NextResponse.json(
        { error: 'REX API returned non-JSON response. The API key may be invalid or the service is unavailable.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log('[REX API] Status check successful:', data);

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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
