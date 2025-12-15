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
    console.log('[Documents API Store] ===== REQUEST RECEIVED =====');
    
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
      console.log('[Documents API Store] Validation failed - missing processId or filename');
      return NextResponse.json(
        { error: 'Missing required fields: processId, filename' },
        { status: 400 }
      );
    }

    console.log(`[Documents API Store] About to store document for user ${userId} with processId ${processId}`);

    // Store document in database
    try {
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
        ON CONFLICT (process_id) DO UPDATE SET
          document_id = EXCLUDED.document_id,
          filename = EXCLUDED.filename,
          document_type = EXCLUDED.document_type,
          file_size = EXCLUDED.file_size,
          updated_at = NOW()
        RETURNING *`,
        [userId, processId, documentId || null, filename, documentType, fileSize || 0, 'pending']
      );

      console.log('[Documents API Store] Query result:', result);

      if (!result || !result.rows || result.rows.length === 0) {
        console.error('[Documents API Store] Query returned no rows!');
        throw new Error('Failed to insert document - no rows returned');
      }

      const document = result.rows[0];

      console.log('[Documents API Store] Document stored successfully:', {
        id: document.id,
        process_id: document.process_id,
        filename: document.filename,
        user_id: document.user_id,
      });

      // Serialize BigInt values for JSON response
      const serializedDocument = serializeBigInt(document);

      console.log('[Documents API Store] ===== SUCCESS =====');
      return NextResponse.json(
        {
          success: true,
          document: serializedDocument,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('[Documents API Store] Database error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('[Documents API Store] ===== ERROR =====');
    console.error('[Documents API Store] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Documents API Store] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Documents API Store] Full error:', error);
    
    if (error instanceof Error) {
      console.error('[Documents API Store] Error stack:', error.stack);
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