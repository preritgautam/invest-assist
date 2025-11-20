import { NextRequest, NextResponse } from 'next/server';

// CLERK BYPASSED - using mock user ID for v0 Vercel compatibility
const MOCK_USER_ID = 'user_bypass_12345';

export async function GET(request: NextRequest) {
    try {
        console.log('[Health Check] Running diagnostics');

        const diagnostics = {
            database: {
                user: 'postgres',
                host: 'localhost',
                database: 'invest assist',
                password: 'P@ssw0rd123',
                port: '5432',
            },
            clerk: {
                status: 'BYPASSED - using mock user ID',
            },
            rex: {
                apiKey: process.env.DOCIN_API_KEY ? '***SET***' : 'NOT SET',
            },
            node_env: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json({
            status: 'ok',
            diagnostics,
            auth: {
                userId: MOCK_USER_ID,
                message: 'Using mock user ID - Clerk bypassed',
            },
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            error: String(error),
        }, { status: 500 });
    }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
