// controllers/enhancedWorkflowController.ts
import { Request, Response } from 'express';
import { EnhancedNodePilotAiService } from '../services/enhancedNodePilotAiService';
import { DocumentationIngestionService } from '../services/documentationIngestionService';
import { Context7IntegrationService } from '../services/context7IntegrationService';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Request validation schemas
const WorkflowGenerationRequestSchema = z.object({
    description: z.string().min(10).max(2000),
    userId: z.string().uuid(),
    userTier: z.enum(['starter', 'pro', 'business']).default('starter'),
    preferences: z.object({
        includeComments: z.boolean().default(false),
        complexityLevel: z.enum(['simple', 'medium', 'complex']).default('medium'),
        maxTokens: z.number().min(1000).max(8000).default(4000)
    }).optional()
});

const DocumentationUpdateRequestSchema = z.object({
    forceUpdate: z.boolean().default(false),
    categories: z.array(z.string()).optional()
});

export class EnhancedWorkflowController {
    private aiService: EnhancedNodePilotAiService;
    private documentationService: DocumentationIngestionService;
    private context7Service: Context7IntegrationService;
    private supabase: any;

    constructor() {
        this.aiService = new EnhancedNodePilotAiService();
        this.documentationService = new DocumentationIngestionService();
        this.context7Service = new Context7IntegrationService();
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    /**
     * Enhanced workflow generation endpoint
     */
    async generateWorkflow(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const validatedRequest = WorkflowGenerationRequestSchema.parse(req.body);

            // Check user credits and permissions
            const creditCheck = await this.validateUserCredits(
                validatedRequest.userId,
                validatedRequest.userTier
            );

            if (!creditCheck.hasCredits) {
                res.status(402).json({
                    error: 'Insufficient credits',
                    creditsRemaining: creditCheck.creditsRemaining,
                    requiredCredits: creditCheck.requiredCredits
                });
                return;
            }

            // Generate workflow with enhanced documentation context
            const result = await this.aiService.generateWorkflowWithContext(validatedRequest);

            // Deduct credits based on actual usage
            const creditsUsed = this.calculateCreditsUsed(result, validatedRequest.userTier);
            await this.deductUserCredits(validatedRequest.userId, creditsUsed);

            // Save workflow to database
            const workflowId = await this.saveWorkflowGeneration(
                validatedRequest.userId,
                validatedRequest.description,
                result
            );

            // Return successful response
            res.json({
                success: true,
                workflowId,
                workflow: result.workflow,
                metadata: {
                    documentationUsed: result.documentationUsed.length,
                    generationTime: result.generationTime,
                    confidence: result.confidence,
                    creditsUsed,
                    tokensUsed: result.totalTokensUsed
                },
                documentationSources: result.documentationUsed.map(doc => ({
                    title: doc.title,
                    category: doc.category,
                    relevance: doc.similarity
                }))
            });

        } catch (error) {
            console.error('Enhanced workflow generation error:', error);
            
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Invalid request format',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                error: 'Failed to generate workflow',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Chat endpoint for general n8n questions
     */
    async handleChat(req: Request, res: Response): Promise<void> {
        try {
            const { message, userId, conversationId } = req.body;

            if (!message || !userId) {
                res.status(400).json({ error: 'Message and userId are required' });
                return;
            }

            // Check if user has credits for chat (0.25 credits)
            const creditCheck = await this.validateUserCredits(userId, 'starter', 0.25);
            
            if (!creditCheck.hasCredits) {
                res.status(402).json({
                    error: 'Insufficient credits for chat',
                    creditsRemaining: creditCheck.creditsRemaining
                });
                return;
            }

            // Process as conversation
            const result = await this.aiService.generateWorkflowWithContext({
                description: message,
                userId,
                userTier: 'starter' // Chat uses basic tier
            });

            // Deduct minimal credits for chat
            await this.deductUserCredits(userId, 0.25);

            res.json({
                success: true,
                response: result.workflow.response,
                conversationId,
                metadata: {
                    documentationUsed: result.documentationUsed.length,
                    creditsUsed: 0.25
                }
            });

        } catch (error) {
            console.error('Chat handling error:', error);
            res.status(500).json({
                error: 'Failed to process chat message',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update documentation from Context7
     */
    async updateDocumentation(req: Request, res: Response): Promise<void> {
        try {
            // Validate admin permissions
            const isAdmin = await this.validateAdminPermissions(req);
            if (!isAdmin) {
                res.status(403).json({ error: 'Admin permissions required' });
                return;
            }

            const validatedRequest = DocumentationUpdateRequestSchema.parse(req.body);

            // Start documentation update
            const updatePromise = this.context7Service.ingestContext7Documentation();

            // Return immediate response for long-running operation
            res.json({
                success: true,
                message: 'Documentation update started',
                estimatedTime: '5-10 minutes'
            });

            // Continue update in background
            try {
                const result = await updatePromise;
                console.log('Documentation update completed:', result);
                
                // Optionally notify via webhook or email
                await this.notifyDocumentationUpdate(result);
                
            } catch (error) {
                console.error('Documentation update failed:', error);
                // Handle error notification
            }

        } catch (error) {
            console.error('Documentation update request error:', error);
            res.status(500).json({
                error: 'Failed to start documentation update',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get documentation statistics
     */
    async getDocumentationStats(req: Request, res: Response): Promise<void> {
        try {
            const [docStats, context7Stats] = await Promise.all([
                this.documentationService.getDocumentationStats(),
                this.context7Service.getContext7Stats()
            ]);

            res.json({
                success: true,
                documentation: docStats,
                context7: context7Stats,
                lastUpdated: new Date().toISOString()
            });

        } catch (error) {
            console.error('Documentation stats error:', error);
            res.status(500).json({
                error: 'Failed to get documentation statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Validate user credits
     */
    private async validateUserCredits(
        userId: string, 
        userTier: string, 
        requiredCredits: number = 1
    ): Promise<{
        hasCredits: boolean;
        creditsRemaining: number;
        requiredCredits: number;
    }> {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('credits_remaining')
                .eq('id', userId)
                .single();

            if (error || !user) {
                return { hasCredits: false, creditsRemaining: 0, requiredCredits };
            }

            const hasCredits = user.credits_remaining >= requiredCredits;
            
            return {
                hasCredits,
                creditsRemaining: user.credits_remaining,
                requiredCredits
            };

        } catch (error) {
            console.error('Credit validation error:', error);
            return { hasCredits: false, creditsRemaining: 0, requiredCredits };
        }
    }

    /**
     * Deduct user credits
     */
    private async deductUserCredits(userId: string, creditsUsed: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ 
                    credits_remaining: this.supabase.raw(`credits_remaining - ${creditsUsed}`)
                })
                .eq('id', userId);

            if (error) {
                console.error('Credit deduction error:', error);
            }

            // Record credit usage
            await this.supabase
                .from('credit_history')
                .insert({
                    user_id: userId,
                    credits_used: creditsUsed,
                    action_type: 'workflow_generation',
                    description: 'Enhanced workflow generation with documentation context'
                });

        } catch (error) {
            console.error('Failed to deduct credits:', error);
        }
    }

    /**
     * Calculate credits used based on result and user tier
     */
    private calculateCreditsUsed(result: any, userTier: string): number {
        // Base credit cost
        let credits = 1;

        // Adjust based on documentation usage
        if (result.documentationUsed.length > 5) {
            credits += 0.5; // Extra cost for extensive documentation usage
        }

        // Tier-based adjustments
        if (userTier === 'pro') {
            credits *= 0.8; // 20% discount for pro users
        } else if (userTier === 'business') {
            credits *= 0.6; // 40% discount for business users
        }

        return Math.round(credits * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Save workflow generation to database
     */
    private async saveWorkflowGeneration(
        userId: string,
        description: string,
        result: any
    ): Promise<string> {
        try {
            const { data, error } = await this.supabase
                .from('workflow_generations')
                .insert({
                    user_id: userId,
                    description,
                    workflow_json: result.workflow,
                    documentation_context: {
                        documentsUsed: result.documentationUsed.length,
                        confidence: result.confidence,
                        generationTime: result.generationTime
                    },
                    documentation_ids: result.documentationUsed.map((doc: any) => doc.id),
                    context_tokens_used: result.totalTokensUsed
                })
                .select('id')
                .single();

            if (error) {
                throw new Error(`Failed to save workflow: ${error.message}`);
            }

            return data.id;

        } catch (error) {
            console.error('Failed to save workflow generation:', error);
            throw error;
        }
    }

    /**
     * Validate admin permissions
     */
    private async validateAdminPermissions(req: Request): Promise<boolean> {
        // Implement admin validation logic
        // For now, return true - replace with actual admin check
        return true;
    }

    /**
     * Notify about documentation update completion
     */
    private async notifyDocumentationUpdate(result: any): Promise<void> {
        // Implement notification logic (email, webhook, etc.)
        console.log('Documentation update notification:', result);
    }
}
