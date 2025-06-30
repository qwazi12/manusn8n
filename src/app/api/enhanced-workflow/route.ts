// src/app/api/enhanced-workflow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedWorkflowController } from '../../../controllers/enhancedWorkflowController';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        // Get user authentication
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        
        // Add userId to the request
        body.userId = userId;

        // Create mock request/response objects for the controller
        const mockReq = {
            body,
            headers: request.headers,
            method: 'POST'
        } as any;

        let responseData: any = null;
        let statusCode = 200;

        const mockRes = {
            json: (data: any) => {
                responseData = data;
            },
            status: (code: number) => {
                statusCode = code;
                return {
                    json: (data: any) => {
                        responseData = data;
                    }
                };
            }
        } as any;

        // Initialize controller at runtime
        const controller = new EnhancedWorkflowController();

        // Call the controller
        await controller.generateWorkflow(mockReq, mockRes);

        return NextResponse.json(responseData, { status: statusCode });

    } catch (error) {
        console.error('Enhanced workflow API error:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get documentation statistics
        const mockReq = {
            method: 'GET',
            headers: request.headers
        } as any;

        let responseData: any = null;
        let statusCode = 200;

        const mockRes = {
            json: (data: any) => {
                responseData = data;
            },
            status: (code: number) => {
                statusCode = code;
                return {
                    json: (data: any) => {
                        responseData = data;
                    }
                };
            }
        } as any;

        // Initialize controller at runtime
        const controller = new EnhancedWorkflowController();

        await controller.getDocumentationStats(mockReq, mockRes);

        return NextResponse.json(responseData, { status: statusCode });

    } catch (error) {
        console.error('Documentation stats API error:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
