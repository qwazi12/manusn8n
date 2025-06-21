import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Call the backend Express server credits endpoint
    const backendUrl = process.env.BACKEND_URL || 'https://manusn8n-production.up.railway.app';
    const response = await fetch(`${backendUrl}/api/credits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Pass user ID as auth
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend credits error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to fetch credits' },
        { status: response.status }
      );
    }

    // 3. Return the credits data
    return NextResponse.json(data);

  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
