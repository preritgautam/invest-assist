import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    console.log('[Documents API Update] Request received');
    
    // Get the authenticated user
    let userId;
    try {
      const authResult = await auth();
      userId = authResult?.userId;
      console.log('[Documents API Update] Clerk auth result:', { userId });
    } catch (authErr) {
      console.error('[Documents API Update] Auth error:', authErr);
      return NextResponse.json(
        { error: 'Authentication failed', details: String(authErr) },
        { status: 401 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - no user ID' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      processId,
      extractionStatus,
      extractionResult,
      errorMessage,
      documentId,
    } = body;

    console.log('[Documents API Update] Received data:', {
      processId,
      extractionStatus,
      errorMessage,
    });

    // Validate required fields
    if (!processId) {
      return NextResponse.json(
        { error: 'Missing required field: processId' },
        { status: 400 }
      );
    }

    console.log(`[Documents API Update] Updating document status for user ${userId}`);

    // Verify the document belongs to this user
    const checkResult = await query(
      'SELECT id FROM documents WHERE process_id = $1 AND user_id = $2',
      [processId, userId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Update document status
    const updateParams = [processId, userId];
    let updateFields = [];
    let paramIndex = 3;

    if (extractionStatus) {
      updateFields.push(`extraction_status = $${paramIndex}`);
      updateParams.push(extractionStatus);
      paramIndex++;
    }

    if (extractionResult) {
      updateFields.push(`extraction_result = $${paramIndex}`);
      updateParams.push(JSON.stringify(extractionResult));
      paramIndex++;
    }

    if (errorMessage) {
      updateFields.push(`error_message = $${paramIndex}`);
      updateParams.push(errorMessage);
      paramIndex++;
    }

    if (documentId) {
      updateFields.push(`document_id = $${paramIndex}`);
      updateParams.push(documentId);
      paramIndex++;
    }

    const result = await query(
      `UPDATE documents 
       SET ${updateFields.join(', ')}
       WHERE process_id = $1 AND user_id = $2
       RETURNING *`,
      updateParams
    );

    const document = result.rows[0];

    console.log('[Documents API Update] Document updated:', document);

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Documents API Update] Error updating document:', error);
    
    // Log full error details
    if (error instanceof Error) {
      console.error('[Documents API Update] Error message:', error.message);
      console.error('[Documents API Update] Error stack:', error.stack);
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
