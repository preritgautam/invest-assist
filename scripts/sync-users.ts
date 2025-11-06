// scripts/sync-users.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClerkClient } from '@clerk/backend';
import { query } from '@/lib/db';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  console.error('Error: CLERK_SECRET_KEY is not defined in .env.local');
  process.exit(1);
}

// Initialize Clerk (modern backend SDK)
const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

async function syncUsers() {
  try {
    const limit = 500;
    let offset = 0;
    let synced = 0;

    while (true) {
      const { data: users, totalCount } = await clerkClient.users.getUserList({
        limit,
        offset,
        orderBy: '-created_at',
      });

      if (!users || users.length === 0) break;

      for (const user of users) {
        // Find the primary email
        const primaryEmail = user.emailAddresses.find(
          (e) => e.id === user.primaryEmailAddressId
        )?.emailAddress ?? null;

        try {
          await query(
            `
INSERT INTO users (id, email, first_name, last_name, image_url)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      image_url = EXCLUDED.image_url,
      updated_at = CURRENT_TIMESTAMP;
          `,
            [
              user.id,
              primaryEmail,
              user.firstName ?? null,
              user.lastName ?? null,
              user.imageUrl ?? null,
            ]
          );
          synced++;
        } catch (err) {
          console.error(`✗ Error syncing user ${user.id}:`, err);
        }
      }

      offset += users.length;
      if (offset >= totalCount) break;
    }

    console.log(`✓ Sync complete. Users processed: ${synced}`);
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    process.exit();
  }
}

syncUsers();
