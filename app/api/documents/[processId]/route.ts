import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// CLERK BYPASSED - using mock user ID for v0 Vercel compatibility
const MOCK_USER_ID = 'user_bypass_12345';

export async function GET(
  request: NextRequest,
  { params }: { params: { processId: string } }
) {
  try {
    console.log('[Documents API Get] Request received');
    
    // CLERK BYPASSED - using mock user ID
    const userId = MOCK_USER_ID;
    console.log('[Documents API Get] Using mock user ID:', { userId });

    const { processId } = params;

    if (!processId) {
      return NextResponse.json(
        { error: 'Missing processId' },
        { status: 400 }
      );
    }

    console.log(`[Documents API Get] Fetching document ${processId} for user ${userId}`);

    // Get document, ensuring it belongs to the current user
    const result = await query(
      `SELECT * FROM documents 
       WHERE process_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [processId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    const document = result.rows[0];

    console.log('[Documents API Get] Document retrieved:', {
      processId,
      filename: document.filename,
      extractionStatus: document.extraction_status,
    });

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Documents API Get] Error fetching document:', error);
    
    if (error instanceof Error) {
      console.error('[Documents API Get] Error message:', error.message);
      console.error('[Documents API Get] Error stack:', error.stack);
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
