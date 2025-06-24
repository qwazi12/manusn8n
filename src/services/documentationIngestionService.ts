// services/documentationIngestionService.ts
import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
     * Fetch n8n documentation from Context7 using the resolve and get tools
     */
    private async fetchContext7N8nDocumentation(): Promise<Context7Document[]> {
        try {
            // Use Context7 tools to fetch n8n documentation
            // This will be implemented using the Context7 MCP tools available
            console.log('Fetching n8n documentation from Context7...');
            
            // For now, return sample data - this will be replaced with actual Context7 integration
            return this.getSampleDocuments();
            
        } catch (error) {
            console.error('Failed to fetch Context7 documentation:', error);
            throw error;
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
