import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Helper function to generate a UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return new NextResponse('Webhook secret not configured', { status: 500 });
    }

    // Get the headers
    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');

    // Debug log the headers
    console.log('Webhook Headers:', {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    });

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new NextResponse('Missing svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.text();
    console.log('Webhook Payload:', payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    
    let event: WebhookEvent;
    
    try {
      event = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      console.error('Secret used:', WEBHOOK_SECRET);
      return new NextResponse('Error verifying webhook', { status: 400 });
    }

    // Handle user.created event
    if (event.type === 'user.created') {
      console.log('Processing user.created event:', event.data);
      const { id: clerkUserId, email_addresses, created_at } = event.data;
      const primaryEmail = email_addresses[0]?.email_address;

      if (!primaryEmail) {
        console.error('No primary email found for user:', clerkUserId);
        return new NextResponse('No primary email found', { status: 400 });
      }

      // Call Supabase Edge Function to create user
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          email: primaryEmail,
          plan: 'free_user',
          credits: 100,
          created_at: new Date(created_at).toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating Supabase user:', error);
        return new NextResponse('Failed to create user in Supabase', { status: 500 });
      }

      const { user: newUser } = await response.json();
      console.log('Created Supabase user:', newUser);

      // Store the Supabase user ID in Clerk's public metadata
      try {
        await clerkClient.users.updateUser(clerkUserId, {
          publicMetadata: {
            supabaseUserId: newUser.id,
            trialStart: new Date().toISOString(),
          },
        });
        console.log('Updated Clerk metadata for user:', clerkUserId);
      } catch (error) {
        console.error('Failed to update Clerk metadata:', error);
      }

      return NextResponse.json({
        message: 'User created successfully',
        user: newUser
      });
    }

    // Handle user.deleted event
    if (event.type === 'user.deleted') {
      console.log('Processing user.deleted event:', event.data);
      const clerkUserId = event.data.id;
      
      // Get the user to find their Supabase ID
      try {
        const user = await clerkClient.users.getUser(clerkUserId);
        const supabaseUserId = user.publicMetadata.supabaseUserId as string;
        
        if (supabaseUserId) {
          // Call Supabase Edge Function to delete user
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ id: supabaseUserId })
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Error deleting Supabase user:', error);
            return new NextResponse('Failed to delete user from Supabase', { status: 500 });
          }

          console.log('Deleted Supabase user:', supabaseUserId);
        }
      } catch (error) {
        console.error('Error processing user deletion:', error);
      }

      return new NextResponse(JSON.stringify({ message: 'User deleted successfully' }));
    }

    console.log('Processed webhook event:', event.type);
    return NextResponse.json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
} 