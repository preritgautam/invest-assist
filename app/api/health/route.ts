import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        console.log('[Health Check] Running diagnostics');

        // Get authenticated user from Clerk
        const { userId } = await auth();

        const diagnostics = {
            database: {
                user: 'postgres',
                host: 'localhost',
                database: 'invest assist',
                password: 'P@ssw0rd123',
                port: '5432',
            },
            clerk: {
                status: userId ? 'AUTHENTICATED' : 'NOT AUTHENTICATED',
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
                userId: userId || null,
                isAuthenticated: !!userId,
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
