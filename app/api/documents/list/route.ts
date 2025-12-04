// app/api/documents/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const documentType = searchParams.get('documentType');
    const uploadStatus = searchParams.get('uploadStatus');

    console.log(`[Documents API] Fetching for user: ${userId}`);

    let whereConditions = ['user_id = $1', 'deleted_at IS NULL'];
    let paramIndex = 2;
    const params: any[] = [userId];

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

    const countResult = await query(
      `SELECT COUNT(*) as total FROM documents WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await query(
      `SELECT id, user_id, process_id, document_id, filename, document_type, 
              file_size, upload_status, extraction_status, created_at, updated_at
       FROM documents 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      documents: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('[Documents API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// // Basic fetch - all documents for user
// const response = await fetch('/api/documents/list?userId=user_bypass_12345');

// // Filter by document type
// const response = await fetch('/api/documents/list?userId=user_bypass_12345&documentType=rent_roll');

// // Filter by upload status
// const response = await fetch('/api/documents/list?userId=user_bypass_12345&uploadStatus=completed');

// // Pagination
// const response = await fetch('/api/documents/list?userId=user_bypass_12345&limit=10&offset=20');

// // Combined filters
// const response = await fetch('/api/documents/list?userId=user_bypass_12345&documentType=rent_roll&uploadStatus=completed&limit=10&offset=0');
