import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { query } from '@/lib/db'; // Your PostgreSQL connection

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    try {
      await query(
        `INSERT INTO users (id, email, first_name, last_name, image_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [
          id,
          primaryEmail?.email_address,
          first_name,
          last_name,
          image_url
        ]
      );
      console.log('User created in database:', id);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error: Database operation failed', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    try {
      await query(
        `UPDATE users
         SET email = $2, first_name = $3, last_name = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          id,
          primaryEmail?.email_address,
          first_name,
          last_name,
          image_url
        ]
      );
      console.log('User updated in database:', id);
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error: Database operation failed', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await query('DELETE FROM users WHERE id = $1', [id]);
      console.log('User deleted from database:', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error: Database operation failed', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
