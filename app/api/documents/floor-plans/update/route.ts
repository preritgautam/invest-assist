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
    console.log('[Floor Plans API] Update request received');

    const userId = MOCK_USER_ID;
    const body = await request.json();

    const {
      documentId,
      floorPlansData,
    } = body;

    console.log('[Floor Plans API] Received data:', {
      documentId,
      floorPlansCount: Object.keys(floorPlansData?.floor_plans || {}).length,
    });

    // Validate required fields
    if (!documentId || !floorPlansData) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, floorPlansData' },
        { status: 400 }
      );
    }

    // Fetch the existing document
    const existingDocResult = await query(
      `SELECT extraction_result FROM documents 
       WHERE document_id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (existingDocResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const existingDoc = existingDocResult.rows[0];
    const extractionResult = existingDoc.extraction_result || {};

    // Deep merge: update floor_plans in the metadata while keeping everything else intact
    if (!extractionResult.data) {
      extractionResult.data = {};
    }
    if (!extractionResult.data.metadataMappings) {
      extractionResult.data.metadataMappings = {};
    }

    // Update only the floor_plans in Floor Plan Analysis
    extractionResult.data.metadataMappings['Floor Plan Analysis'] = {
      floor_plans: floorPlansData.floor_plans,
    };

    console.log('[Floor Plans API] Updating document with modified floor plans');

    // Update the document with the modified extraction_result
    const result = await query(
      `UPDATE documents 
       SET extraction_result = $1, updated_at = NOW() 
       WHERE document_id = $2 AND user_id = $3 
       RETURNING *`,
      [JSON.stringify(extractionResult), documentId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    const updatedDocument = result.rows[0];

    console.log('[Floor Plans API] Floor plan changes saved to document successfully');

    return NextResponse.json(
      {
        success: true,
        document: serializeBigInt(updatedDocument),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Floor Plans API] Error saving floor plans:', error);

    if (error instanceof Error) {
      console.error('[Floor Plans API] Error message:', error.message);
      console.error('[Floor Plans API] Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save floor plans',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
