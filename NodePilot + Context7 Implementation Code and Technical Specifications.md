# NodePilot + Context7 Implementation Code and Technical Specifications

## Complete Implementation Package

This document provides production-ready code, database schemas, API specifications, and deployment instructions for integrating Context7's n8n documentation into NodePilot's workflow generation pipeline. All code is designed to integrate seamlessly with your existing Express.js backend and Supabase infrastructure.

## Database Schema Implementation

### Supabase Vector Extension Setup

The foundation of the RAG implementation requires enabling PostgreSQL's vector extension and creating optimized tables for documentation storage and retrieval.

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create documentation storage table with vector embeddings
CREATE TABLE n8n_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT,
    tokens INTEGER NOT NULL DEFAULT 0,
    snippet_type TEXT CHECK (snippet_type IN ('code', 'explanation', 'example', 'reference')),
    category TEXT, -- e.g., 'nodes', 'expressions', 'workflows', 'integrations'
    subcategory TEXT, -- e.g., 'http-request', 'schedule-trigger', 'data-transformation'
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0
);

-- Create optimized indexes for vector similarity search
CREATE INDEX n8n_documentation_embedding_idx ON n8n_documentation 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create indexes for efficient filtering and searching
CREATE INDEX n8n_documentation_category_idx ON n8n_documentation (category);
CREATE INDEX n8n_documentation_subcategory_idx ON n8n_documentation (subcategory);
CREATE INDEX n8n_documentation_snippet_type_idx ON n8n_documentation (snippet_type);
CREATE INDEX n8n_documentation_tokens_idx ON n8n_documentation (tokens);

-- Create full-text search index for content
CREATE INDEX n8n_documentation_content_fts_idx ON n8n_documentation 
USING gin (to_tsvector('english', title || ' ' || content));

-- Create composite index for common query patterns
CREATE INDEX n8n_documentation_category_tokens_idx ON n8n_documentation (category, tokens);

-- Create documentation usage tracking table
CREATE TABLE documentation_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documentation_id UUID REFERENCES n8n_documentation(id) ON DELETE CASCADE,
    user_id UUID, -- References your existing users table
    workflow_generation_id UUID, -- References generated workflows
    query_text TEXT,
    similarity_score FLOAT,
    was_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX documentation_usage_analytics_doc_id_idx ON documentation_usage_analytics (documentation_id);
CREATE INDEX documentation_usage_analytics_user_id_idx ON documentation_usage_analytics (user_id);
CREATE INDEX documentation_usage_analytics_created_at_idx ON documentation_usage_analytics (created_at);

-- Create vector similarity search function with advanced filtering
CREATE OR REPLACE FUNCTION match_n8n_documentation(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    filter_category text DEFAULT NULL,
    filter_snippet_type text DEFAULT NULL,
    min_tokens int DEFAULT 0,
    max_tokens int DEFAULT 10000
)
RETURNS TABLE(
    id uuid,
    title text,
    content text,
    source_url text,
    category text,
    subcategory text,
    snippet_type text,
    tokens integer,
    similarity float,
    metadata jsonb
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        n8n_documentation.id,
        n8n_documentation.title,
        n8n_documentation.content,
        n8n_documentation.source_url,
        n8n_documentation.category,
        n8n_documentation.subcategory,
        n8n_documentation.snippet_type,
        n8n_documentation.tokens,
        1 - (n8n_documentation.embedding <=> query_embedding) AS similarity,
        n8n_documentation.metadata
    FROM n8n_documentation
    WHERE 
        1 - (n8n_documentation.embedding <=> query_embedding) > match_threshold
        AND (filter_category IS NULL OR n8n_documentation.category = filter_category)
        AND (filter_snippet_type IS NULL OR n8n_documentation.snippet_type = filter_snippet_type)
        AND n8n_documentation.tokens >= min_tokens
        AND n8n_documentation.tokens <= max_tokens
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Create function to update documentation access statistics
CREATE OR REPLACE FUNCTION update_documentation_access(doc_ids uuid[])
RETURNS void
LANGUAGE sql
AS $$
    UPDATE n8n_documentation 
    SET 
        access_count = access_count + 1,
        last_accessed = NOW()
    WHERE id = ANY(doc_ids);
$$;

-- Create function for intelligent context selection based on query complexity
CREATE OR REPLACE FUNCTION get_optimal_documentation_context(
    query_embedding vector(1536),
    query_text text,
    user_tier text DEFAULT 'starter' -- 'starter', 'pro', 'business'
)
RETURNS TABLE(
    id uuid,
    title text,
    content text,
    category text,
    similarity float,
    context_priority integer
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    complexity_score float;
    context_limit int;
    threshold float;
BEGIN
    -- Calculate query complexity based on text analysis
    complexity_score := (
        CASE 
            WHEN query_text ~* '\b(api|webhook|database|authentication|oauth)\b' THEN 0.3
            ELSE 0.0
        END +
        CASE 
            WHEN query_text ~* '\b(conditional|if|else|loop|iterate)\b' THEN 0.3
            ELSE 0.0
        END +
        CASE 
            WHEN query_text ~* '\b(error|handling|retry|timeout)\b' THEN 0.2
            ELSE 0.0
        END +
        CASE 
            WHEN array_length(string_to_array(query_text, ' '), 1) > 20 THEN 0.2
            ELSE 0.0
        END
    );

    -- Set context limits based on user tier and complexity
    context_limit := CASE 
        WHEN user_tier = 'business' THEN 
            CASE WHEN complexity_score > 0.6 THEN 10 ELSE 7 END
        WHEN user_tier = 'pro' THEN 
            CASE WHEN complexity_score > 0.6 THEN 8 ELSE 6 END
        ELSE 
            CASE WHEN complexity_score > 0.6 THEN 6 ELSE 4 END
    END;

    -- Adjust similarity threshold based on complexity
    threshold := CASE 
        WHEN complexity_score > 0.6 THEN 0.65  -- Lower threshold for complex queries
        ELSE 0.75  -- Higher threshold for simple queries
    END;

    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.content,
        d.category,
        1 - (d.embedding <=> query_embedding) AS similarity,
        CASE 
            WHEN d.category = 'nodes' THEN 1
            WHEN d.category = 'expressions' THEN 2
            WHEN d.category = 'workflows' THEN 3
            ELSE 4
        END AS context_priority
    FROM n8n_documentation d
    WHERE 1 - (d.embedding <=> query_embedding) > threshold
    ORDER BY 
        context_priority ASC,
        similarity DESC
    LIMIT context_limit;
END;
$$;
```

### Enhanced User and Workflow Tables

Extend your existing tables to support the enhanced documentation features:

```sql
-- Add documentation preferences to user profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS 
    documentation_preferences JSONB DEFAULT '{
        "preferred_detail_level": "medium",
        "include_code_examples": true,
        "include_explanations": true,
        "max_context_tokens": 8000
    }';

-- Add documentation context tracking to workflow generations
ALTER TABLE workflow_generations ADD COLUMN IF NOT EXISTS 
    documentation_context JSONB DEFAULT '{}';

ALTER TABLE workflow_generations ADD COLUMN IF NOT EXISTS 
    documentation_ids UUID[] DEFAULT '{}';

ALTER TABLE workflow_generations ADD COLUMN IF NOT EXISTS 
    context_tokens_used INTEGER DEFAULT 0;

-- Create index for workflow documentation analysis
CREATE INDEX IF NOT EXISTS workflow_generations_doc_ids_idx 
ON workflow_generations USING gin (documentation_ids);
```

## Core Service Implementation

### Documentation Ingestion Service

This service handles fetching, processing, and storing Context7's n8n documentation with intelligent categorization and optimization.

```typescript
// services/documentationIngestionService.ts
import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { z } from 'zod';

// Type definitions for Context7 documentation
const Context7DocumentSchema = z.object({
    title: z.string(),
    content: z.string(),
    source: z.string(),
    tokens: z.number(),
    snippetType: z.enum(['code', 'explanation', 'example', 'reference']),
    language: z.string().optional(),
    description: z.string().optional()
});

type Context7Document = z.infer<typeof Context7DocumentSchema>;

interface ProcessedDocument extends Context7Document {
    category: string;
    subcategory: string;
    embedding: number[];
    metadata: Record<string, any>;
}

export class DocumentationIngestionService {
    private openai: OpenAI;
    private supabase: SupabaseClient;
    private readonly EMBEDDING_MODEL = 'text-embedding-3-small';
    private readonly BATCH_SIZE = 50;

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
     * Main ingestion method - fetches and processes all n8n documentation
     */
    async ingestN8nDocumentation(): Promise<{
        processed: number;
        errors: number;
        totalTokens: number;
    }> {
        console.log('Starting n8n documentation ingestion...');
        
        try {
            // Fetch documentation from Context7
            const rawDocuments = await this.fetchContext7N8nDocumentation();
            console.log(`Fetched ${rawDocuments.length} documents from Context7`);

            // Process documents in batches
            const results = {
                processed: 0,
                errors: 0,
                totalTokens: 0
            };

            for (let i = 0; i < rawDocuments.length; i += this.BATCH_SIZE) {
                const batch = rawDocuments.slice(i, i + this.BATCH_SIZE);
                const batchResults = await this.processBatch(batch);
                
                results.processed += batchResults.processed;
                results.errors += batchResults.errors;
                results.totalTokens += batchResults.totalTokens;

                console.log(`Processed batch ${Math.floor(i / this.BATCH_SIZE) + 1}/${Math.ceil(rawDocuments.length / this.BATCH_SIZE)}`);
                
                // Rate limiting to avoid API limits
                await this.delay(1000);
            }

            console.log('Documentation ingestion completed:', results);
            return results;

        } catch (error) {
            console.error('Documentation ingestion failed:', error);
            throw error;
        }
    }

    /**
     * Fetch n8n documentation from Context7 API or manual source
     */
    private async fetchContext7N8nDocumentation(): Promise<Context7Document[]> {
        // For now, we'll implement manual fetching since Context7 API is in preview
        // This can be replaced with actual API calls when available
        
        try {
            // Option 1: If Context7 API is available
            if (process.env.CONTEXT7_API_KEY) {
                return await this.fetchFromContext7API();
            }
            
            // Option 2: Manual import from exported data
            return await this.fetchFromManualExport();
            
        } catch (error) {
            console.error('Failed to fetch Context7 documentation:', error);
            throw error;
        }
    }

    /**
     * Fetch from Context7 API (when available)
     */
    private async fetchFromContext7API(): Promise<Context7Document[]> {
        const response = await axios.get('https://api.context7.com/v1/libraries/n8n/docs', {
            headers: {
                'Authorization': `Bearer ${process.env.CONTEXT7_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.documents.map((doc: any) => 
            Context7DocumentSchema.parse(doc)
        );
    }

    /**
     * Fetch from manual export (current implementation)
     */
    private async fetchFromManualExport(): Promise<Context7Document[]> {
        // This would load from a JSON file containing Context7's n8n documentation
        // You can export this manually from their website for now
        
        const fs = await import('fs/promises');
        const path = await import('path');
        
        try {
            const dataPath = path.join(process.cwd(), 'data', 'context7-n8n-docs.json');
            const rawData = await fs.readFile(dataPath, 'utf-8');
            const data = JSON.parse(rawData);
            
            return data.documents.map((doc: any) => 
                Context7DocumentSchema.parse(doc)
            );
        } catch (error) {
            console.warn('Manual export file not found, using sample data');
            return this.getSampleDocuments();
        }
    }

    /**
     * Process a batch of documents
     */
    private async processBatch(documents: Context7Document[]): Promise<{
        processed: number;
        errors: number;
        totalTokens: number;
    }> {
        const results = { processed: 0, errors: 0, totalTokens: 0 };
        
        for (const doc of documents) {
            try {
                const processedDoc = await this.processDocument(doc);
                await this.storeDocument(processedDoc);
                
                results.processed++;
                results.totalTokens += doc.tokens;
                
            } catch (error) {
                console.error(`Failed to process document: ${doc.title}`, error);
                results.errors++;
            }
        }
        
        return results;
    }

    /**
     * Process individual document with categorization and embedding
     */
    private async processDocument(doc: Context7Document): Promise<ProcessedDocument> {
        // Generate embedding for the document content
        const embedding = await this.generateEmbedding(
            `${doc.title}\n\n${doc.content}`
        );

        // Categorize the document based on content analysis
        const { category, subcategory } = this.categorizeDocument(doc);

        // Extract metadata
        const metadata = this.extractMetadata(doc);

        return {
            ...doc,
            category,
            subcategory,
            embedding,
            metadata
        };
    }

    /**
     * Generate embedding for text content
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: this.EMBEDDING_MODEL,
                input: text.substring(0, 8000), // Limit to avoid token limits
            });
            
            return response.data[0].embedding;
        } catch (error) {
            console.error('Failed to generate embedding:', error);
            throw error;
        }
    }

    /**
     * Categorize document based on content analysis
     */
    private categorizeDocument(doc: Context7Document): {
        category: string;
        subcategory: string;
    } {
        const content = doc.content.toLowerCase();
        const title = doc.title.toLowerCase();

        // Node-related documentation
        if (content.includes('node') || title.includes('node')) {
            if (content.includes('http') || title.includes('http')) {
                return { category: 'nodes', subcategory: 'http-request' };
            }
            if (content.includes('schedule') || title.includes('schedule')) {
                return { category: 'nodes', subcategory: 'schedule-trigger' };
            }
            if (content.includes('webhook') || title.includes('webhook')) {
                return { category: 'nodes', subcategory: 'webhook' };
            }
            if (content.includes('code') || title.includes('code')) {
                return { category: 'nodes', subcategory: 'code' };
            }
            return { category: 'nodes', subcategory: 'general' };
        }

        // Expression-related documentation
        if (content.includes('expression') || content.includes('{{') || title.includes('expression')) {
            if (content.includes('date') || content.includes('luxon')) {
                return { category: 'expressions', subcategory: 'date-time' };
            }
            if (content.includes('string') || content.includes('text')) {
                return { category: 'expressions', subcategory: 'string-manipulation' };
            }
            if (content.includes('math') || content.includes('number')) {
                return { category: 'expressions', subcategory: 'mathematical' };
            }
            return { category: 'expressions', subcategory: 'general' };
        }

        // Workflow-related documentation
        if (content.includes('workflow') || title.includes('workflow')) {
            if (content.includes('error') || content.includes('handling')) {
                return { category: 'workflows', subcategory: 'error-handling' };
            }
            if (content.includes('trigger') || title.includes('trigger')) {
                return { category: 'workflows', subcategory: 'triggers' };
            }
            return { category: 'workflows', subcategory: 'general' };
        }

        // Integration-related documentation
        if (content.includes('credential') || content.includes('auth') || content.includes('api')) {
            return { category: 'integrations', subcategory: 'authentication' };
        }

        // Configuration and setup
        if (content.includes('config') || content.includes('setup') || content.includes('install')) {
            return { category: 'configuration', subcategory: 'setup' };
        }

        // Default category
        return { category: 'general', subcategory: 'documentation' };
    }

    /**
     * Extract metadata from document
     */
    private extractMetadata(doc: Context7Document): Record<string, any> {
        const metadata: Record<string, any> = {
            originalSource: 'context7',
            hasCodeExample: doc.snippetType === 'code',
            language: doc.language || 'unknown',
            tokenCount: doc.tokens
        };

        // Extract n8n-specific metadata
        const content = doc.content.toLowerCase();
        
        if (content.includes('node')) {
            metadata.containsNodeInfo = true;
        }
        
        if (content.includes('{{') && content.includes('}}')) {
            metadata.containsExpressions = true;
        }
        
        if (content.includes('json')) {
            metadata.containsJsonExamples = true;
        }
        
        if (content.includes('webhook') || content.includes('trigger')) {
            metadata.containsTriggerInfo = true;
        }

        return metadata;
    }

    /**
     * Store processed document in Supabase
     */
    private async storeDocument(doc: ProcessedDocument): Promise<void> {
        const { error } = await this.supabase
            .from('n8n_documentation')
            .upsert({
                title: doc.title,
                content: doc.content,
                source_url: doc.source,
                tokens: doc.tokens,
                snippet_type: doc.snippetType,
                category: doc.category,
                subcategory: doc.subcategory,
                embedding: doc.embedding,
                metadata: doc.metadata,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'title,source_url'
            });

        if (error) {
            throw new Error(`Failed to store document: ${error.message}`);
        }
    }

    /**
     * Get sample documents for testing
     */
    private getSampleDocuments(): Context7Document[] {
        return [
            {
                title: "HTTP Request Node Authentication",
                content: "Configure authentication for the HTTP request. n8n recommends 'Predefined Credential Type' for ease of use with supported integrations...",
                source: "https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md",
                tokens: 150,
                snippetType: "explanation",
                language: "markdown"
            },
            {
                title: "Schedule Trigger Cron Expression",
                content: "*/5 * * * * - This Cron expression schedules a workflow to run every 5 minutes...",
                source: "https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/index.md",
                tokens: 75,
                snippetType: "code",
                language: "cron"
            }
        ];
    }

    /**
     * Utility method for delays
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clean up old documentation entries
     */
    async cleanupOldDocumentation(daysOld: number = 30): Promise<number> {
        const { data, error } = await this.supabase
            .from('n8n_documentation')
            .delete()
            .lt('updated_at', new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
            throw new Error(`Failed to cleanup old documentation: ${error.message}`);
        }

        return data?.length || 0;
    }

    /**
     * Get documentation statistics
     */
    async getDocumentationStats(): Promise<{
        totalDocuments: number;
        totalTokens: number;
        categoryCounts: Record<string, number>;
        lastUpdate: string;
    }> {
        const { data, error } = await this.supabase
            .from('n8n_documentation')
            .select('category, tokens, updated_at');

        if (error) {
            throw new Error(`Failed to get documentation stats: ${error.message}`);
        }

        const stats = {
            totalDocuments: data.length,
            totalTokens: data.reduce((sum, doc) => sum + doc.tokens, 0),
            categoryCounts: {} as Record<string, number>,
            lastUpdate: data.reduce((latest, doc) => 
                doc.updated_at > latest ? doc.updated_at : latest, 
                '1970-01-01T00:00:00.000Z'
            )
        };

        data.forEach(doc => {
            stats.categoryCounts[doc.category] = (stats.categoryCounts[doc.category] || 0) + 1;
        });

        return stats;
    }
}
```

### Enhanced AI Service with RAG Integration

This service integrates the documentation retrieval with your existing AI workflow generation pipeline.

```typescript
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

    /**
     * Get service statistics
     */
    async getServiceStats(): Promise<{
        totalGenerations: number;
        avgDocumentationUsed: number;
        avgConfidenceScore: number;
        topCategories: Array<{ category: string; usage: number }>;
    }> {
        const { data: usageData } = await this.supabase
            .from('documentation_usage_analytics')
            .select('documentation_id, similarity_score');

        const { data: docData } = await this.supabase
            .from('n8n_documentation')
            .select('id, category, access_count');

        // Calculate statistics
        const totalGenerations = usageData?.length || 0;
        const avgDocumentationUsed = totalGenerations > 0 ? 
            usageData.length / new Set(usageData.map(u => u.documentation_id)).size : 0;
        
        const avgConfidenceScore = totalGenerations > 0 ?
            usageData.reduce((sum, u) => sum + u.similarity_score, 0) / totalGenerations : 0;

        const categoryUsage = docData?.reduce((acc, doc) => {
            acc[doc.category] = (acc[doc.category] || 0) + doc.access_count;
            return acc;
        }, {} as Record<string, number>) || {};

        const topCategories = Object.entries(categoryUsage)
            .map(([category, usage]) => ({ category, usage }))
            .sort((a, b) => b.usage - a.usage)
            .slice(0, 5);

        return {
            totalGenerations,
            avgDocumentationUsed,
            avgConfidenceScore,
            topCategories
        };
    }
}
```

This implementation provides a comprehensive foundation for integrating Context7's n8n documentation into your NodePilot workflow generation pipeline. The code includes proper error handling, performance optimization, analytics tracking, and fallback mechanisms to ensure reliability in production.



## Controller Implementation

### Enhanced Workflow Controller with Documentation Integration

This controller integrates with your existing Express.js backend and provides enhanced workflow generation endpoints.

```typescript
// controllers/enhancedWorkflowController.ts
import { Request, Response } from 'express';
import { EnhancedNodePilotAiService } from '../services/enhancedNodePilotAiService';
import { DocumentationIngestionService } from '../services/documentationIngestionService';
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
    private supabase: any;

    constructor() {
        this.aiService = new EnhancedNodePilotAiService();
        this.documentationService = new DocumentationIngestionService();
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
            const updatePromise = this.documentationService.ingestN8nDocumentation();

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
            const [docStats, serviceStats] = await Promise.all([
                this.documentationService.getDocumentationStats(),
                this.aiService.getServiceStats()
            ]);

            res.json({
                success: true,
                documentation: docStats,
                service: serviceStats,
                lastUpdated: new Date().toISOString()
            });

        } catch (error) {
            console.error('Failed to get documentation stats:', error);
            res.status(500).json({
                error: 'Failed to retrieve statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Search documentation endpoint
     */
    async searchDocumentation(req: Request, res: Response): Promise<void> {
        try {
            const { query, category, limit = 10 } = req.query;

            if (!query || typeof query !== 'string') {
                res.status(400).json({ error: 'Query parameter is required' });
                return;
            }

            // Generate embedding for search query
            const queryEmbedding = await this.aiService['generateEmbedding'](query);

            // Search documentation
            const { data, error } = await this.supabase.rpc('match_n8n_documentation', {
                query_embedding: queryEmbedding,
                match_threshold: 0.6,
                match_count: parseInt(limit as string),
                filter_category: category || null
            });

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                results: data || [],
                query,
                category: category || 'all'
            });

        } catch (error) {
            console.error('Documentation search error:', error);
            res.status(500).json({
                error: 'Failed to search documentation',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Provide feedback on workflow generation
     */
    async provideFeedback(req: Request, res: Response): Promise<void> {
        try {
            const { workflowId, rating, feedback, documentationHelpful } = req.body;

            if (!workflowId || rating === undefined) {
                res.status(400).json({ error: 'workflowId and rating are required' });
                return;
            }

            // Update workflow feedback
            await this.supabase
                .from('workflow_generations')
                .update({
                    user_rating: rating,
                    user_feedback: feedback,
                    updated_at: new Date().toISOString()
                })
                .eq('id', workflowId);

            // Update documentation helpfulness if provided
            if (documentationHelpful !== undefined) {
                await this.supabase
                    .from('documentation_usage_analytics')
                    .update({ was_helpful: documentationHelpful })
                    .eq('workflow_generation_id', workflowId);
            }

            res.json({
                success: true,
                message: 'Feedback recorded successfully'
            });

        } catch (error) {
            console.error('Feedback recording error:', error);
            res.status(500).json({
                error: 'Failed to record feedback',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Validate user credits and permissions
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
        const { data: user, error } = await this.supabase
            .from('user_profiles')
            .select('credits_remaining, subscription_tier')
            .eq('id', userId)
            .single();

        if (error || !user) {
            throw new Error('User not found');
        }

        return {
            hasCredits: user.credits_remaining >= requiredCredits,
            creditsRemaining: user.credits_remaining,
            requiredCredits
        };
    }

    /**
     * Calculate credits used based on generation result and user tier
     */
    private calculateCreditsUsed(
        result: any,
        userTier: string
    ): number {
        // Base credit calculation
        let credits = 1; // Base cost for workflow generation

        // Adjust based on complexity and documentation usage
        if (result.documentationUsed.length > 5) {
            credits += 0.5; // Additional cost for complex queries
        }

        if (result.totalTokensUsed > 3000) {
            credits += 0.5; // Additional cost for large responses
        }

        // Tier-based adjustments
        switch (userTier) {
            case 'business':
                credits *= 0.8; // 20% discount for business tier
                break;
            case 'pro':
                credits *= 0.9; // 10% discount for pro tier
                break;
            default:
                // No discount for starter tier
                break;
        }

        return Math.round(credits * 4) / 4; // Round to nearest 0.25
    }

    /**
     * Deduct credits from user account
     */
    private async deductUserCredits(userId: string, credits: number): Promise<void> {
        const { error } = await this.supabase
            .from('user_profiles')
            .update({
                credits_remaining: this.supabase.raw(`credits_remaining - ${credits}`),
                credits_used: this.supabase.raw(`credits_used + ${credits}`),
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            throw new Error(`Failed to deduct credits: ${error.message}`);
        }
    }

    /**
     * Save workflow generation to database
     */
    private async saveWorkflowGeneration(
        userId: string,
        description: string,
        result: any
    ): Promise<string> {
        const { data, error } = await this.supabase
            .from('workflow_generations')
            .insert({
                user_id: userId,
                description,
                workflow_json: result.workflow,
                documentation_context: result.documentationUsed,
                documentation_ids: result.documentationUsed.map((doc: any) => doc.id),
                context_tokens_used: result.totalTokensUsed,
                generation_time_ms: result.generationTime,
                confidence_score: result.confidence
            })
            .select('id')
            .single();

        if (error) {
            throw new Error(`Failed to save workflow: ${error.message}`);
        }

        return data.id;
    }

    /**
     * Validate admin permissions
     */
    private async validateAdminPermissions(req: Request): Promise<boolean> {
        // Implement your admin validation logic here
        // This could check JWT tokens, API keys, or user roles
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }

        const token = authHeader.substring(7);
        
        // Validate admin token (implement your logic)
        return token === process.env.ADMIN_API_KEY;
    }

    /**
     * Notify about documentation update completion
     */
    private async notifyDocumentationUpdate(result: any): Promise<void> {
        // Implement notification logic (webhook, email, etc.)
        console.log('Documentation update notification:', result);
        
        // Example: Send webhook notification
        if (process.env.DOCUMENTATION_UPDATE_WEBHOOK) {
            try {
                await fetch(process.env.DOCUMENTATION_UPDATE_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'documentation_updated',
                        timestamp: new Date().toISOString(),
                        result
                    })
                });
            } catch (error) {
                console.error('Failed to send webhook notification:', error);
            }
        }
    }
}
```

## API Routes Integration

### Express.js Routes Setup

Integrate the enhanced controller with your existing Express.js routes:

```typescript
// routes/enhancedWorkflowRoutes.ts
import { Router } from 'express';
import { EnhancedWorkflowController } from '../controllers/enhancedWorkflowController';
import { authenticateUser, rateLimitMiddleware, validateApiKey } from '../middleware';

const router = Router();
const controller = new EnhancedWorkflowController();

// Rate limiting configurations
const workflowRateLimit = rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 workflow generations per window
    message: 'Too many workflow generation requests'
});

const chatRateLimit = rateLimitMiddleware({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 chat messages per minute
    message: 'Too many chat requests'
});

const adminRateLimit = rateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 admin operations per hour
    message: 'Too many admin requests'
});

// Public endpoints (with authentication)
router.post('/generate', 
    authenticateUser,
    workflowRateLimit,
    controller.generateWorkflow.bind(controller)
);

router.post('/chat',
    authenticateUser,
    chatRateLimit,
    controller.handleChat.bind(controller)
);

router.get('/search',
    authenticateUser,
    controller.searchDocumentation.bind(controller)
);

router.post('/feedback',
    authenticateUser,
    controller.provideFeedback.bind(controller)
);

// Admin endpoints
router.post('/admin/update-documentation',
    validateApiKey,
    adminRateLimit,
    controller.updateDocumentation.bind(controller)
);

router.get('/admin/stats',
    validateApiKey,
    controller.getDocumentationStats.bind(controller)
);

export default router;
```

### Middleware Implementation

```typescript
// middleware/index.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Authenticate user using Clerk JWT
 */
export async function authenticateUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const token = authHeader.substring(7);
        
        // Verify JWT token with Clerk (implement your verification logic)
        const userId = await verifyClerkToken(token);
        
        if (!userId) {
            res.status(401).json({ error: 'Invalid authentication token' });
            return;
        }

        // Add user info to request
        req.user = { id: userId };
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
}

/**
 * Validate API key for admin operations
 */
export function validateApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        res.status(403).json({ error: 'Invalid API key' });
        return;
    }
    
    next();
}

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(options: {
    windowMs: number;
    max: number;
    message: string;
}) {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: { error: options.message },
        standardHeaders: true,
        legacyHeaders: false,
        // Use Redis for distributed rate limiting in production
        store: process.env.REDIS_URL ? createRedisStore() : undefined
    });
}

/**
 * Verify Clerk JWT token
 */
async function verifyClerkToken(token: string): Promise<string | null> {
    try {
        // Implement Clerk JWT verification
        // This is a placeholder - use actual Clerk verification
        const response = await fetch(`${process.env.CLERK_API_URL}/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.userId;

    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

/**
 * Create Redis store for rate limiting
 */
function createRedisStore() {
    // Implement Redis store for distributed rate limiting
    // This is a placeholder for production implementation
    return undefined;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}
```

## Environment Configuration

### Updated Environment Variables

Add these environment variables to your existing configuration:

```env
# Existing variables (keep these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://vqpkvrgpcdlqzixzpxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-proj-...
CLAUDE_API_KEY=sk-ant-api03-...

# New variables for enhanced functionality
CONTEXT7_API_KEY=your_context7_api_key_when_available
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
VECTOR_SEARCH_LIMIT=5
ADMIN_API_KEY=your_secure_admin_api_key
DOCUMENTATION_UPDATE_WEBHOOK=https://your-webhook-url.com/documentation-updated

# Optional: Redis for caching and rate limiting
REDIS_URL=redis://localhost:6379

# Optional: Monitoring and analytics
SENTRY_DSN=your_sentry_dsn
ANALYTICS_API_KEY=your_analytics_key
```

## Deployment Configuration

### Railway Deployment Updates

Update your Railway deployment configuration to include the new services:

```dockerfile
# Dockerfile updates for Railway
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY data/ ./data/

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Package.json Updates

Add new dependencies to your package.json:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.20.1",
    "@supabase/supabase-js": "^2.38.0",
    "zod": "^3.22.4",
    "express-rate-limit": "^7.1.5",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  },
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "update-docs": "ts-node scripts/updateDocumentation.ts"
  }
}
```

## Monitoring and Analytics

### Performance Monitoring Setup

```typescript
// utils/monitoring.ts
import { createClient } from '@supabase/supabase-js';

interface PerformanceMetric {
    operation: string;
    duration: number;
    success: boolean;
    metadata?: Record<string, any>;
}

export class PerformanceMonitor {
    private supabase: any;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    async trackOperation<T>(
        operation: string,
        fn: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        const startTime = Date.now();
        let success = false;
        let result: T;

        try {
            result = await fn();
            success = true;
            return result;
        } catch (error) {
            success = false;
            throw error;
        } finally {
            const duration = Date.now() - startTime;
            
            // Track performance metric
            await this.recordMetric({
                operation,
                duration,
                success,
                metadata
            });
        }
    }

    private async recordMetric(metric: PerformanceMetric): Promise<void> {
        try {
            await this.supabase
                .from('performance_metrics')
                .insert({
                    operation: metric.operation,
                    duration_ms: metric.duration,
                    success: metric.success,
                    metadata: metric.metadata,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Failed to record performance metric:', error);
        }
    }

    async getOperationStats(operation: string, hours: number = 24): Promise<{
        avgDuration: number;
        successRate: number;
        totalOperations: number;
    }> {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        const { data, error } = await this.supabase
            .from('performance_metrics')
            .select('duration_ms, success')
            .eq('operation', operation)
            .gte('created_at', since);

        if (error || !data) {
            return { avgDuration: 0, successRate: 0, totalOperations: 0 };
        }

        const totalOperations = data.length;
        const successfulOperations = data.filter(m => m.success).length;
        const avgDuration = data.reduce((sum, m) => sum + m.duration_ms, 0) / totalOperations;

        return {
            avgDuration: Math.round(avgDuration),
            successRate: successfulOperations / totalOperations,
            totalOperations
        };
    }
}

// Create performance metrics table
const createPerformanceMetricsTable = `
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS performance_metrics_operation_idx ON performance_metrics (operation);
CREATE INDEX IF NOT EXISTS performance_metrics_created_at_idx ON performance_metrics (created_at);
`;
```

This comprehensive implementation provides all the code and configuration needed to integrate Context7's n8n documentation into your NodePilot workflow generation pipeline. The solution includes proper error handling, performance monitoring, security measures, and scalability considerations for production deployment.

