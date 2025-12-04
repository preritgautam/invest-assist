import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
        { status: 401 }
      );
    }

    console.log('[Documents API Store] Request received');
    console.log('[Documents API Store] Storing for user:', { userId });

    const body = await request.json();
    const {
      processId,
      documentId,
      filename,
      documentType,
      fileSize,
    } = body;

    console.log('[Documents API Store] Received data:', {
      processId,
      documentId,
      filename,
      documentType,
      fileSize,
    });

    // Validate required fields
    if (!processId || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: processId, filename' },
        { status: 400 }
      );
    }

    console.log(`[Documents API Store] Storing document for user ${userId}`);

    // Store document in database
    const result = await query(
      `INSERT INTO documents (
        user_id,
        process_id,
        document_id,
        filename,
        document_type,
        file_size,
        upload_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [userId, processId, documentId || null, filename, documentType, fileSize || 0, 'completed']
    );

    const document = result.rows[0];

    console.log('[Documents API Store] Document stored:', document);

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[Documents API Store] Error storing document:', error);
    
    // Log full error details
    if (error instanceof Error) {
      console.error('[Documents API Store] Error message:', error.message);
      console.error('[Documents API Store] Error stack:', error.stack);
    }
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Document with this process ID already exists' },
        { status: 409 }
      );
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