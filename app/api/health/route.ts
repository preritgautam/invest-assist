import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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
                publishable: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '***SET***' : 'NOT SET',
                secret: process.env.CLERK_SECRET_KEY ? '***SET***' : 'NOT SET',
            },
            rex: {
                apiKey: process.env.DOCIN_API_KEY ? '***SET***' : 'NOT SET',
            },
            node_env: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        };

        // Try to get Clerk auth
        let clerkError = null;
        let clerkUserId = null;
        try {
            const authResult = await auth();
            clerkUserId = authResult?.userId;
        } catch (err) {
            clerkError = String(err);
        }

        return NextResponse.json({
            status: 'ok',
            diagnostics,
            clerk_auth: {
                error: clerkError,
                userId: clerkUserId,
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
