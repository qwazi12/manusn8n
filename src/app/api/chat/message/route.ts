import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Get request body
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 3. Call the backend Express server enhanced chat endpoint
    const backendUrl = process.env.BACKEND_URL || 'https://manusn8n-production.up.railway.app';
    const response = await fetch(`${backendUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to process message' },
        { status: response.status }
      );
    }

    // 4. Return the enhanced chat response
    return NextResponse.json({
      success: data.success,
      message: data.message,
      conversationResponse: data.conversationResponse,
      workflow: data.workflow,
      suggestions: data.suggestions,
      creditsRemaining: data.creditsRemaining,
    });

  } catch (error) {
    console.error('Enhanced chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
