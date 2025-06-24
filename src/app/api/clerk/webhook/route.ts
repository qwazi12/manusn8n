import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';

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

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Handle user.created event
    if (event.type === 'user.created') {
      console.log('Processing user.created event:', event.data);
      const { id: clerkUserId, email_addresses, first_name, last_name, created_at } = event.data;
      const primaryEmail = email_addresses[0]?.email_address;

      if (!primaryEmail) {
        console.error('No primary email found for user:', clerkUserId);
        return new NextResponse('No primary email found', { status: 400 });
      }

      // Insert user directly into Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkUserId,
          email: primaryEmail,
          first_name: first_name || null,
          last_name: last_name || null,
          plan: 'free_user',
          credits: 25, // Free trial: 25 credits for 7 days
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          created_at: new Date(created_at).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating Supabase user:', error);
        return new NextResponse('Failed to create user in Supabase', { status: 500 });
      }

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
      
      // Delete user from Supabase using clerk_id
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerkUserId);

      if (error) {
        console.error('Error deleting Supabase user:', error);
        return new NextResponse('Failed to delete user from Supabase', { status: 500 });
      }

      console.log('Deleted Supabase user with clerk_id:', clerkUserId);
      return NextResponse.json({ message: 'User deleted successfully' });
    }

    console.log('Processed webhook event:', event.type);
    return NextResponse.json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
} 