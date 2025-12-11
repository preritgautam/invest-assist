import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// CLERK BYPASSED - using mock user ID for v0 Vercel compatibility
const MOCK_USER_ID = 'user_bypass_12345';

// Helper function to convert BigInt values to numbers/strings for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeBigInt(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Documents API Store] Request received');
    
    // CLERK BYPASSED - using mock user ID
    const userId = MOCK_USER_ID;
    console.log('[Documents API Store] Using mock user ID:', { userId });

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

    // Serialize BigInt values for JSON response
    const serializedDocument = serializeBigInt(document);

    return NextResponse.json(
      {
        success: true,
        document: serializedDocument,
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