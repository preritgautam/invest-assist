// scripts/sync-users.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { Clerk } from '@clerk/clerk-sdk-node';
import { query } from '../lib/db';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
    console.error('Error: CLERK_SECRET_KEY is not defined in .env.local');
    process.exit(1);
}

// Initialize Clerk (v4)
const clerk = Clerk({ secretKey: clerkSecretKey });

async function syncUsers() {
    try {
        // Clerk v4 returns User[] directly
        const users = await clerk.users.getUserList({ limit: 500 });

        for (const user of users) {
            const primaryEmail = user.emailAddresses.find(
                (email: { id: string }) => email.id === user.primaryEmailAddressId
            );

            try {
                await query(
                    `INSERT INTO users (id, email, first_name, last_name, image_url)
   VALUES ($1, $2, $3, $4, $5)
   ON CONFLICT (id) DO UPDATE
   SET email = $2, first_name = $3, last_name = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP`,
                    [
                        user.id,
                        primaryEmail?.emailAddress,
                        user.firstName,
                        user.lastName,
                        user.imageUrl
                    ]
                );

            } catch (error) {
                console.error(`✗ Error syncing user ${user.id}:`, error);
            }
        }

    } catch (error) {
        console.error('Error during sync:', error);
    } finally {
        process.exit();
    }
}

syncUsers();
