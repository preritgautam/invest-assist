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
    console.log('[Rent Roll Config API] Update request received');

    const userId = MOCK_USER_ID;
    const body = await request.json();

    const {
      documentId,
      tenantChargesData,
      occupancyMappingsData,
    } = body;

    console.log('[Rent Roll Config API] Received data:', {
      documentId,
      tenantChargesCount: Object.keys(tenantChargesData || {}).length,
      occupancyMappingsCount: Object.keys(occupancyMappingsData || {}).length,
    });

    // Validate required fields
    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing required field: documentId' },
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

    // Deep merge: update config in the metadata while keeping everything else intact
    if (!extractionResult.data) {
      extractionResult.data = {};
    }
    if (!extractionResult.data.metadataMappings) {
      extractionResult.data.metadataMappings = {};
    }

    // Update tenant charges configuration - preserve all original categories
    if (tenantChargesData) {
      // Get existing mapping to preserve original category structure
      const existingMapping = extractionResult.data.metadataMappings['Mapping for the charges'] || {};
      
      // Create merged mapping that preserves all original categories
      const mergedMapping: Record<string, string[]> = {};
      
      // First, initialize all original categories with empty arrays
      Object.keys(existingMapping).forEach(category => {
        mergedMapping[category] = [];
      });
      
      // Then apply the new mappings from the request
      Object.entries(tenantChargesData).forEach(([category, codes]) => {
        mergedMapping[category] = Array.isArray(codes) ? codes : [];
      });
      
      // Keep all original categories, even if they end up empty after remapping
      extractionResult.data.metadataMappings['Mapping for the charges'] = mergedMapping;
      
      console.log('[Rent Roll Config API] Updated mapping for the charges:', mergedMapping);
    }

    // Update occupancy mappings configuration
    if (occupancyMappingsData) {
      if (!extractionResult.data.metadataMappings['Occupancy Mapping']) {
        extractionResult.data.metadataMappings['Occupancy Mapping'] = {};
      }
      // Preserve validation field if it exists
      const existingValidation = extractionResult.data.metadataMappings['Occupancy Mapping'].validation;
      extractionResult.data.metadataMappings['Occupancy Mapping'] = {
        ...occupancyMappingsData,
        ...(existingValidation ? { validation: existingValidation } : {}),
      };
    }

    console.log('[Rent Roll Config API] Updating document with modified configurations');

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

    console.log('[Rent Roll Config API] Rent roll configurations saved to document successfully');

    return NextResponse.json(
      {
        success: true,
        document: serializeBigInt(updatedDocument),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Rent Roll Config API] Error saving configurations:', error);

    if (error instanceof Error) {
      console.error('[Rent Roll Config API] Error message:', error.message);
      console.error('[Rent Roll Config API] Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to save configurations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
