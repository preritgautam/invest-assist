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

    console.log(`[REX API] Fetching results for process: ${processId}`);

    // Call REX API result endpoint
    const response = await fetch(
      `https://dev-try.docin.ai/api/v1/rex/result/${processId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[REX API] Result fetch error:', errorText);
      return NextResponse.json(
        { error: `REX API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[REX API] Result fetch successful:', data);

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
