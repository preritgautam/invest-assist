// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
        { status: 401 }
      );
    }

    const rawId = (params.id ?? '').trim();
    console.log(`[Document API] Fetching document with raw ID: "${rawId}"`);

    if (!rawId) {
      return NextResponse.json({ success: false, error: 'Missing document id' }, { status: 400 });
    }

    const isNumeric = /^[0-9]+$/.test(rawId);
    const isUuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawId);

    // Toggle to true to temporarily ignore deleted_at for debugging (remove later)
    const TEST_IGNORE_SOFT_DELETE = true;

    let whereClause = TEST_IGNORE_SOFT_DELETE ? '' : 'AND deleted_at IS NULL';
    let sql: string;
    let paramsArr: any[];

    if (isNumeric) {
      sql = `SELECT * FROM documents WHERE id = $1 ${whereClause} LIMIT 1`;
      paramsArr = [parseInt(rawId, 10)];
    } else if (isUuidLike) {
      sql = `SELECT * FROM documents WHERE lower(document_id::text) = $1 ${whereClause} LIMIT 1`;
      paramsArr = [rawId.toLowerCase()];
    } else {
      sql = `SELECT * FROM documents WHERE (lower(document_id::text) = $1 OR id::text = $1) ${whereClause} LIMIT 1`;
      paramsArr = [rawId.toLowerCase()];
    }

    console.log('[Document API] SQL:', sql);
    console.log('[Document API] Params:', paramsArr);

    const result = await query(sql, paramsArr);
    console.log('[Document API] SQL returned rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log(`[Document API] Document not found: ${rawId}`);
      return NextResponse.json({ success: false, error: 'Document not found or access denied' }, { status: 404 });
    }

    const document = result.rows[0];
    console.log(`[Document API] Found document: ${document.filename} (id=${document.id})`);
    return NextResponse.json({ success: true, document });
  } catch (err) {
    console.error('[Document API] Error fetching document:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
