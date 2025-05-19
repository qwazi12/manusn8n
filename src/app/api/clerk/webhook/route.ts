import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('Missing Clerk webhook secret');
    return new NextResponse('Webhook not configured', { status: 500 });
  }

  const payload = await req.text();
  // Get the headers from the request
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // On user.created: set trialStart in Clerk public metadata
  if (event.type === 'user.created') {
    const userId = event.data.id;
    const trialStart = new Date().toISOString();

    try {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          trialStart,
        },
      });
      console.log(`trialStart set for ${userId}: ${trialStart}`);
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
      return new NextResponse('Failed to update metadata', { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
} 