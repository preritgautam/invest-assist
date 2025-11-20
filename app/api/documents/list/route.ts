import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// CLERK BYPASSED - using mock user ID for v0 Vercel compatibility
const MOCK_USER_ID = 'user_bypass_12345';

export async function GET(request: NextRequest) {
  try {
    console.log('[Documents API List] Request received');
    
    // CLERK BYPASSED - using mock user ID
    const userId = MOCK_USER_ID;
    console.log('[Documents API List] Using mock user ID:', { userId });

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const documentType = searchParams.get('documentType');
    const uploadStatus = searchParams.get('uploadStatus');

    console.log(`[Documents API List] Fetching documents for user ${userId}`);

    // Build dynamic WHERE clause
    let whereConditions = ['user_id = $1', 'deleted_at IS NULL'];
    let paramIndex = 2;
    const params = [userId];

    if (documentType) {
      whereConditions.push(`document_type = $${paramIndex}`);
      params.push(documentType);
      paramIndex++;
    }

    if (uploadStatus) {
      whereConditions.push(`upload_status = $${paramIndex}`);
      params.push(uploadStatus);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM documents WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated documents
    const result = await query(
      `SELECT id, user_id, process_id, document_id, filename, document_type, 
              file_size, upload_status, extraction_status, created_at, updated_at
       FROM documents 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const documents = result.rows;

    console.log(`[Documents API List] Retrieved ${documents.length} documents for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        documents,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Documents API List] Error fetching documents:', error);
    
    if (error instanceof Error) {
      console.error('[Documents API List] Error message:', error.message);
      console.error('[Documents API List] Error stack:', error.stack);
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
