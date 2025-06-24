// src/app/api/documentation-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedWorkflowController } from '../../../controllers/enhancedWorkflowController';
import { auth } from '@clerk/nextjs';

const controller = new EnhancedWorkflowController();

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

        // Create mock request/response objects for the controller
        const mockReq = {
            body,
            headers: request.headers,
            method: 'POST',
            user: { id: userId } // Add user info for admin validation
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

        // Call the controller
        await controller.updateDocumentation(mockReq, mockRes);

        return NextResponse.json(responseData, { status: statusCode });

    } catch (error) {
        console.error('Documentation update API error:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
