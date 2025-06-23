// services/enhancedNodePilotAiService.ts
import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Type definitions
interface DocumentationContext {
    id: string;
    title: string;
    content: string;
    category: string;
    similarity: number;
    tokens: number;
}

interface WorkflowGenerationRequest {
    description: string;
    userId: string;
    userTier: 'starter' | 'pro' | 'business';
    preferences?: {
        includeComments: boolean;
        complexityLevel: 'simple' | 'medium' | 'complex';
        maxTokens: number;
    };
}

interface WorkflowGenerationResult {
    workflow: any;
    documentationUsed: DocumentationContext[];
    totalTokensUsed: number;
    generationTime: number;
    confidence: number;
}

export class EnhancedNodePilotAiService {
    private openai: OpenAI;
    private supabase: SupabaseClient;
    private readonly EMBEDDING_MODEL = 'text-embedding-3-small';
    private readonly GENERATION_MODEL = 'gpt-4o';
    private readonly CONVERSATION_MODEL = 'gpt-4o-mini';

    constructor() {
        this.openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
        });
        
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    /**
     * Main workflow generation method with enhanced documentation context
     */
    async generateWorkflowWithContext(
        request: WorkflowGenerationRequest
    ): Promise<WorkflowGenerationResult> {
        const startTime = Date.now();
        
        try {
            // Step 1: Analyze the user request and determine if it's a workflow generation
            const isWorkflowRequest = await this.classifyRequest(request.description);
            
            if (!isWorkflowRequest) {
                // Handle as general conversation
                return await this.handleGeneralConversation(request);
            }

            // Step 2: Generate embedding for the user description
            const queryEmbedding = await this.generateEmbedding(request.description);
            
            // Step 3: Retrieve relevant documentation with intelligent filtering
            const relevantDocs = await this.retrieveOptimalDocumentation(
                queryEmbedding,
                request.description,
                request.userTier
            );
            
            // Step 4: Construct enhanced prompt with documentation context
            const enhancedPrompt = await this.constructEnhancedPrompt(
                request.description,
                relevantDocs,
                request.preferences
            );
            
            // Step 5: Generate workflow with enhanced context
            const workflow = await this.generateWorkflow(enhancedPrompt, request.preferences);
            
            // Step 6: Track usage and update analytics
            await this.trackDocumentationUsage(
                relevantDocs,
                request.userId,
                request.description
            );
            
            // Step 7: Calculate confidence score
            const confidence = this.calculateConfidenceScore(workflow, relevantDocs);
            
            const generationTime = Date.now() - startTime;
            
            return {
                workflow,
                documentationUsed: relevantDocs,
                totalTokensUsed: this.calculateTokenUsage(enhancedPrompt, workflow),
                generationTime,
                confidence
            };

        } catch (error) {
            console.error('Enhanced workflow generation failed:', error);
            
            // Fallback to basic generation without documentation context
            console.warn('Falling back to basic workflow generation');
            return await this.generateBasicWorkflow(request);
        }
    }

    /**
     * Classify whether the request is for workflow generation or general conversation
     */
    private async classifyRequest(description: string): Promise<boolean> {
        const classificationPrompt = `
Analyze the following user input and determine if it's a request to generate an n8n workflow or just general conversation.

User input: "${description}"

Respond with only "WORKFLOW" if it's a workflow generation request, or "CONVERSATION" if it's general conversation.

Examples:
- "Create a workflow that sends emails when new files are uploaded" -> WORKFLOW
- "How do I use the HTTP node?" -> CONVERSATION
- "Build an automation for Slack notifications" -> WORKFLOW
- "What is n8n?" -> CONVERSATION
`;

        const response = await this.openai.chat.completions.create({
            model: this.CONVERSATION_MODEL,
            messages: [{ role: 'user', content: classificationPrompt }],
            temperature: 0.1,
            max_tokens: 10
        });

        return response.choices[0].message.content?.trim() === 'WORKFLOW';
    }

    /**
     * Handle general conversation with n8n context
     */
    private async handleGeneralConversation(
        request: WorkflowGenerationRequest
    ): Promise<WorkflowGenerationResult> {
        // For conversations, we still use documentation but with different prompting
        const queryEmbedding = await this.generateEmbedding(request.description);
        const relevantDocs = await this.retrieveOptimalDocumentation(
            queryEmbedding,
            request.description,
            request.userTier,
            3 // Fewer docs for conversations
        );

        const conversationPrompt = this.constructConversationPrompt(
            request.description,
            relevantDocs
        );

        const response = await this.openai.chat.completions.create({
            model: this.CONVERSATION_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful n8n expert assistant. Provide accurate, helpful information about n8n workflows and automation.'
                },
                {
                    role: 'user',
                    content: conversationPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        return {
            workflow: { 
                type: 'conversation',
                response: response.choices[0].message.content 
            },
            documentationUsed: relevantDocs,
            totalTokensUsed: response.usage?.total_tokens || 0,
            generationTime: 0,
            confidence: 0.8
        };
    }

    /**
     * Retrieve optimal documentation with intelligent filtering
     */
    private async retrieveOptimalDocumentation(
        queryEmbedding: number[],
        queryText: string,
        userTier: string,
        maxDocs?: number
    ): Promise<DocumentationContext[]> {
        try {
            const { data, error } = await this.supabase.rpc(
                'get_optimal_documentation_context',
                {
                    query_embedding: queryEmbedding,
                    query_text: queryText,
                    user_tier: userTier
                }
            );

            if (error) {
                console.error('Documentation retrieval error:', error);
                return [];
            }

            const docs = (data || []).slice(0, maxDocs || 10).map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                content: doc.content,
                category: doc.category,
                similarity: doc.similarity,
                tokens: doc.content.split(' ').length // Approximate token count
            }));

            // Update access statistics
            if (docs.length > 0) {
                await this.supabase.rpc('update_documentation_access', {
                    doc_ids: docs.map(doc => doc.id)
                });
            }

            return docs;

        } catch (error) {
            console.error('Failed to retrieve documentation:', error);
            return [];
        }
    }

    /**
     * Construct enhanced prompt with documentation context
     */
    private async constructEnhancedPrompt(
        userDescription: string,
        docs: DocumentationContext[],
        preferences?: WorkflowGenerationRequest['preferences']
    ): Promise<string> {
        // Sort documentation by relevance and category priority
        const sortedDocs = docs.sort((a, b) => {
            const categoryPriority = { 'nodes': 1, 'expressions': 2, 'workflows': 3, 'integrations': 4 };
            const aPriority = categoryPriority[a.category as keyof typeof categoryPriority] || 5;
            const bPriority = categoryPriority[b.category as keyof typeof categoryPriority] || 5;
            
            if (aPriority !== bPriority) return aPriority - bPriority;
            return b.similarity - a.similarity;
        });

        // Construct documentation context with token management
        let documentationContext = '';
        let totalTokens = 0;
        const maxContextTokens = preferences?.maxTokens || 6000;

        for (const doc of sortedDocs) {
            const docSection = `## ${doc.title} (${doc.category})\n${doc.content}\n\n`;
            const docTokens = doc.tokens;
            
            if (totalTokens + docTokens > maxContextTokens) {
                break;
            }
            
            documentationContext += docSection;
            totalTokens += docTokens;
        }

        const systemPrompt = `You are an expert n8n workflow generator with access to the latest n8n documentation. Your task is to create accurate, functional n8n workflow JSON based on user requirements.

IMPORTANT GUIDELINES:
1. Use ONLY the provided documentation for accurate node configurations
2. Generate complete, valid n8n workflow JSON
3. Include proper node connections and data flow
4. Add helpful comments if requested
5. Ensure all node types and parameters are correct according to the documentation

CURRENT N8N DOCUMENTATION:
${documentationContext}

WORKFLOW REQUIREMENTS:
- Complexity Level: ${preferences?.complexityLevel || 'medium'}
- Include Comments: ${preferences?.includeComments ? 'Yes' : 'No'}
- Focus on accuracy and functionality over complexity`;

        const userPrompt = `USER REQUEST:
${userDescription}

Generate a complete n8n workflow JSON that accomplishes this request. Use the provided documentation to ensure accuracy.

RESPONSE FORMAT:
Return only valid JSON in this format:
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "active": false,
  "settings": {},
  "staticData": {}
}`;

        return `${systemPrompt}\n\n${userPrompt}`;
    }

    /**
     * Construct conversation prompt with documentation context
     */
    private constructConversationPrompt(
        userQuestion: string,
        docs: DocumentationContext[]
    ): string {
        const documentationContext = docs
            .map(doc => `## ${doc.title}\n${doc.content}`)
            .join('\n\n');

        return `
Based on the following n8n documentation, please answer the user's question accurately and helpfully.

RELEVANT N8N DOCUMENTATION:
${documentationContext}

USER QUESTION:
${userQuestion}

Please provide a clear, helpful answer based on the documentation provided. If the documentation doesn't contain enough information to fully answer the question, mention that and provide what information you can.`;
    }

    /**
     * Generate workflow using OpenAI with enhanced context
     */
    private async generateWorkflow(
        prompt: string,
        preferences?: WorkflowGenerationRequest['preferences']
    ): Promise<any> {
        const response = await this.openai.chat.completions.create({
            model: this.GENERATION_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: preferences?.maxTokens || 4000,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('No content generated');
        }

        try {
            return JSON.parse(content);
        } catch (error) {
            console.error('Failed to parse generated workflow JSON:', error);
            throw new Error('Generated content is not valid JSON');
        }
    }

    /**
     * Fallback to basic workflow generation without documentation context
     */
    private async generateBasicWorkflow(
        request: WorkflowGenerationRequest
    ): Promise<WorkflowGenerationResult> {
        const basicPrompt = `Generate a basic n8n workflow JSON for: ${request.description}`;
        
        const response = await this.openai.chat.completions.create({
            model: this.GENERATION_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an n8n workflow generator. Generate valid n8n workflow JSON.'
                },
                {
                    role: 'user',
                    content: basicPrompt
                }
            ],
            temperature: 0.2,
            max_tokens: 3000,
            response_format: { type: "json_object" }
        });

        const workflow = JSON.parse(response.choices[0].message.content || '{}');

        return {
            workflow,
            documentationUsed: [],
            totalTokensUsed: response.usage?.total_tokens || 0,
            generationTime: 0,
            confidence: 0.5 // Lower confidence without documentation
        };
    }

    /**
     * Generate embedding for text
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model: this.EMBEDDING_MODEL,
            input: text.substring(0, 8000), // Limit input length
        });
        
        return response.data[0].embedding;
    }

    /**
     * Track documentation usage for analytics
     */
    private async trackDocumentationUsage(
        docs: DocumentationContext[],
        userId: string,
        queryText: string
    ): Promise<void> {
        try {
            const usageRecords = docs.map(doc => ({
                documentation_id: doc.id,
                user_id: userId,
                query_text: queryText,
                similarity_score: doc.similarity,
                was_helpful: null // Will be updated based on user feedback
            }));

            await this.supabase
                .from('documentation_usage_analytics')
                .insert(usageRecords);

        } catch (error) {
            console.error('Failed to track documentation usage:', error);
            // Don't throw - this is non-critical
        }
    }

    /**
     * Calculate confidence score based on documentation relevance
     */
    private calculateConfidenceScore(
        workflow: any,
        docs: DocumentationContext[]
    ): number {
        if (docs.length === 0) return 0.5;

        // Base confidence on documentation similarity scores
        const avgSimilarity = docs.reduce((sum, doc) => sum + doc.similarity, 0) / docs.length;
        
        // Adjust based on workflow complexity and documentation coverage
        const nodeCount = workflow.nodes?.length || 0;
        const complexityFactor = Math.min(nodeCount / 5, 1); // Normalize to 0-1
        
        // Higher confidence with more relevant docs and appropriate complexity
        return Math.min(avgSimilarity * 0.7 + complexityFactor * 0.3, 0.95);
    }

    /**
     * Calculate total token usage for cost tracking
     */
    private calculateTokenUsage(prompt: string, workflow: any): number {
        // Rough estimation: 1 token ≈ 4 characters
        const promptTokens = Math.ceil(prompt.length / 4);
        const responseTokens = Math.ceil(JSON.stringify(workflow).length / 4);
        
        return promptTokens + responseTokens;
    }
}
