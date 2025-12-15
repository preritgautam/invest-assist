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

export async function PUT(request: NextRequest) {
  try {
    console.log('[Documents API Update] Request received');
    
    // CLERK BYPASSED - using mock user ID
    const userId = MOCK_USER_ID;
    console.log('[Documents API Update] Using mock user ID:', { userId });

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

    console.log(`[Documents API Update] Updating document status`);

    // Verify the document exists by processId
    let checkResult = await query(
      'SELECT id, user_id, process_id FROM documents WHERE process_id = $1',
      [processId]
    );

    // If document doesn't exist, create it
    if (checkResult.rows.length === 0) {
      console.log('[Documents API Update] Document not found, creating placeholder document for processId:', processId);
      
      try {
        const createResult = await query(
          `INSERT INTO documents (
            user_id,
            process_id,
            document_id,
            filename,
            document_type,
            upload_status
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, user_id, process_id`,
          [MOCK_USER_ID, processId, documentId || null, 'Unknown Document', 'unknown', 'pending']
        );
        
        console.log('[Documents API Update] Created placeholder document:', createResult.rows[0]);
        checkResult = createResult;
      } catch (insertErr) {
        console.error('[Documents API Update] Error creating placeholder document:', insertErr);
        // If it's a duplicate key error, retry the select
        if (insertErr instanceof Error && insertErr.message.includes('duplicate')) {
          const retryResult = await query(
            'SELECT id, user_id, process_id FROM documents WHERE process_id = $1',
            [processId]
          );
          if (retryResult.rows.length === 0) {
            return NextResponse.json(
              { error: 'Failed to create or find document' },
              { status: 500 }
            );
          }
          checkResult = retryResult;
        } else {
          throw insertErr;
        }
      }
    } else {
      console.log('[Documents API Update] Document found:', checkResult.rows[0]);
    }

    // Update document status
    const updateParams = [processId];
    let updateFields = [];
    let paramIndex = 2;

    if (extractionStatus) {
      updateFields.push(`extraction_status = $${paramIndex}`);
      updateParams.push(extractionStatus);
      paramIndex++;
    }

    if (extractionResult) {
      updateFields.push(`extraction_result = $${paramIndex}::jsonb`);
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
       WHERE process_id = $1
       RETURNING *`,
      updateParams
    );

    const document = result.rows[0];

    console.log('[Documents API Update] Document updated:', document);

    return NextResponse.json(
      {
        success: true,
        document: serializeBigInt(document),
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
