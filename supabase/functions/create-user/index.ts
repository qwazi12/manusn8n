import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse the request body
    const { email, plan = 'free_user', credits = 25, created_at } = await req.json()

    // Log environment variables (redacted)
    console.log('Environment variables:', {
      url: Deno.env.get('DB_URL')?.substring(0, 10) + '...',
      key: 'exists: ' + !!Deno.env.get('SERVICE_KEY')
    })

    // Validate required fields
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('DB_URL') ?? '',
      Deno.env.get('SERVICE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Log the attempt
    console.log('Attempting to create user:', { email, plan, credits })

    // Insert user with service role privileges
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        plan,
        credits,
        created_at: created_at || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Successfully created user:', data)

    return new Response(JSON.stringify({ user: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Server error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}) 