// src/services/ai/ragService.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import { supabaseService } from '../database/supabaseService';
import fs from 'fs/promises';
import path from 'path';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    section: string;
    nodeType?: string;
    category: string;
  };
  embedding?: number[];
}

export interface RAGQuery {
  query: string;
  maxResults?: number;
  category?: string;
  nodeType?: string;
}

export interface RAGResult {
  content: string;
  source: string;
  relevanceScore: number;
  metadata: any;
}

class RAGService {
  private anthropic: Anthropic;
  private static instance: RAGService;
  private documentChunks: DocumentChunk[] = [];
  private isInitialized: boolean = false;

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
    
    this.initializeKnowledgeBase();
    logger.info('RAG service initialized');
  }

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Initialize the n8n knowledge base
   */
  private async initializeKnowledgeBase(): Promise<void> {
    try {
      // Load n8n documentation chunks
      await this.loadN8nDocumentation();
      
      // Load workflow best practices
      await this.loadBestPractices();
      
      // Load common node configurations
      await this.loadNodeConfigurations();
      
      this.isInitialized = true;
      logger.info(`RAG knowledge base initialized with ${this.documentChunks.length} chunks`);
    } catch (error) {
      logger.error('Error initializing RAG knowledge base:', error);
      // Set up fallback knowledge
      this.setupFallbackKnowledge();
    }
  }

  /**
   * Load n8n documentation chunks
   */
  private async loadN8nDocumentation(): Promise<void> {
    // This would typically load from a vector database or pre-processed docs
    // For now, we'll create some essential n8n knowledge chunks
    
    const n8nDocs: DocumentChunk[] = [
      {
        id: 'n8n-workflow-structure',
        content: `n8n workflows consist of nodes and connections. Each workflow has:
        - nodes: Array of node objects with id, type, position, parameters, and name
        - connections: Object defining how nodes are connected
        - settings: Workflow-level configuration
        - credentials: Authentication information for external services
        
        Basic structure:
        {
          "nodes": [...],
          "connections": {...},
          "settings": {...}
        }`,
        metadata: {
          source: 'n8n-docs',
          section: 'workflow-structure',
          category: 'core'
        }
      },
      {
        id: 'n8n-webhook-node',
        content: `Webhook node (n8n-nodes-base.webhook) is used to trigger workflows via HTTP requests.
        
        Parameters:
        - path: URL path for the webhook (required)
        - httpMethod: GET, POST, PUT, DELETE, etc.
        - authentication: none, basicAuth, headerAuth
        - responseMode: onReceived, lastNode, responseNode
        
        Example:
        {
          "id": "webhook1",
          "type": "n8n-nodes-base.webhook",
          "parameters": {
            "path": "my-webhook",
            "httpMethod": "POST"
          }
        }`,
        metadata: {
          source: 'n8n-docs',
          section: 'nodes',
          nodeType: 'webhook',
          category: 'trigger'
        }
      },
      {
        id: 'n8n-http-request-node',
        content: `HTTP Request node (n8n-nodes-base.httpRequest) makes HTTP calls to external APIs.
        
        Parameters:
        - url: Target URL (required)
        - method: GET, POST, PUT, DELETE, PATCH
        - headers: Custom headers object
        - body: Request body for POST/PUT requests
        - authentication: none, basicAuth, oAuth2, etc.
        
        Example:
        {
          "id": "http1",
          "type": "n8n-nodes-base.httpRequest",
          "parameters": {
            "url": "https://api.example.com/data",
            "method": "GET"
          }
        }`,
        metadata: {
          source: 'n8n-docs',
          section: 'nodes',
          nodeType: 'httpRequest',
          category: 'action'
        }
      },
      {
        id: 'n8n-slack-node',
        content: `Slack node (n8n-nodes-base.slack) integrates with Slack for messaging.
        
        Operations:
        - postMessage: Send message to channel
        - updateMessage: Update existing message
        - getChannels: List channels
        - getUsers: List users
        
        Parameters for postMessage:
        - channel: Channel ID or name (required)
        - text: Message text (required)
        - username: Bot username
        - attachments: Rich message attachments
        
        Requires Slack credentials (OAuth2 or Bot Token).`,
        metadata: {
          source: 'n8n-docs',
          section: 'nodes',
          nodeType: 'slack',
          category: 'communication'
        }
      },
      {
        id: 'n8n-google-sheets-node',
        content: `Google Sheets node (n8n-nodes-base.googleSheets) manages Google Sheets data.
        
        Operations:
        - append: Add new rows
        - read: Read sheet data
        - update: Update existing rows
        - clear: Clear sheet content
        
        Parameters:
        - spreadsheetId: Google Sheets ID (required)
        - range: A1 notation range (e.g., "Sheet1!A1:D10")
        - values: Data to write (for append/update)
        
        Requires Google Sheets credentials (OAuth2 or Service Account).`,
        metadata: {
          source: 'n8n-docs',
          section: 'nodes',
          nodeType: 'googleSheets',
          category: 'productivity'
        }
      },
      {
        id: 'n8n-expressions',
        content: `n8n expressions allow dynamic data manipulation using {{ }} syntax.
        
        Common patterns:
        - {{ $json.fieldName }}: Access JSON field from previous node
        - {{ $node["NodeName"].json.field }}: Access specific node output
        - {{ $now }}: Current timestamp
        - {{ $workflow.id }}: Current workflow ID
        - {{ $execution.id }}: Current execution ID
        
        Functions:
        - {{ $json.email.toLowerCase() }}: String manipulation
        - {{ Math.round($json.price) }}: Math operations
        - {{ new Date($json.date) }}: Date operations
        
        Use expressions in node parameters for dynamic workflows.`,
        metadata: {
          source: 'n8n-docs',
          section: 'expressions',
          category: 'core'
        }
      }
    ];

    this.documentChunks.push(...n8nDocs);
  }

  /**
   * Load workflow best practices
   */
  private async loadBestPractices(): Promise<void> {
    const bestPractices: DocumentChunk[] = [
      {
        id: 'error-handling-best-practices',
        content: `n8n Error Handling Best Practices:
        
        1. Use Try/Catch blocks for critical operations
        2. Add error handling nodes after risky operations
        3. Set meaningful error messages
        4. Use IF nodes to check data before processing
        5. Implement retry logic for API calls
        6. Log errors for debugging
        
        Example error handling:
        - Add "Stop and Error" node for critical failures
        - Use "Continue on Fail" setting for non-critical operations
        - Implement fallback workflows for error scenarios`,
        metadata: {
          source: 'best-practices',
          section: 'error-handling',
          category: 'practices'
        }
      },
      {
        id: 'workflow-organization',
        content: `n8n Workflow Organization Best Practices:
        
        1. Use descriptive node names
        2. Add Notes nodes for documentation
        3. Group related nodes visually
        4. Use consistent naming conventions
        5. Keep workflows focused on single purposes
        6. Break complex workflows into sub-workflows
        
        Naming conventions:
        - Triggers: "Trigger: [Source]"
        - Actions: "Action: [What it does]"
        - Conditions: "Check: [Condition]"
        - Transformations: "Transform: [Data type]"`,
        metadata: {
          source: 'best-practices',
          section: 'organization',
          category: 'practices'
        }
      },
      {
        id: 'security-best-practices',
        content: `n8n Security Best Practices:
        
        1. Use environment variables for sensitive data
        2. Implement webhook authentication
        3. Validate input data
        4. Use HTTPS for all external calls
        5. Rotate credentials regularly
        6. Limit workflow permissions
        
        Webhook security:
        - Add authentication headers
        - Validate request signatures
        - Use HTTPS endpoints only
        - Implement rate limiting
        
        Credential management:
        - Store in n8n credential store
        - Use OAuth2 when possible
        - Never hardcode secrets in workflows`,
        metadata: {
          source: 'best-practices',
          section: 'security',
          category: 'practices'
        }
      }
    ];

    this.documentChunks.push(...bestPractices);
  }

  /**
   * Load common node configurations
   */
  private async loadNodeConfigurations(): Promise<void> {
    const nodeConfigs: DocumentChunk[] = [
      {
        id: 'common-trigger-patterns',
        content: `Common n8n Trigger Patterns:
        
        1. Webhook Triggers:
        - Use for real-time integrations
        - Set appropriate HTTP methods
        - Add authentication for security
        
        2. Schedule Triggers:
        - Use cron expressions for timing
        - Consider timezone settings
        - Add error handling for missed executions
        
        3. Manual Triggers:
        - Good for testing and one-off executions
        - Use "Execute Workflow" node for sub-workflows
        
        4. File Triggers:
        - Monitor file system changes
        - Set appropriate file filters
        - Handle large files carefully`,
        metadata: {
          source: 'node-configs',
          section: 'triggers',
          category: 'patterns'
        }
      }
    ];

    this.documentChunks.push(...nodeConfigs);
  }

  /**
   * Setup fallback knowledge when full initialization fails
   */
  private setupFallbackKnowledge(): void {
    this.documentChunks = [
      {
        id: 'fallback-basic',
        content: `Basic n8n workflow structure includes nodes and connections. 
        Common nodes: webhook (triggers), HTTP Request (API calls), Slack (messaging), 
        Google Sheets (data), Set (data transformation).`,
        metadata: {
          source: 'fallback',
          section: 'basic',
          category: 'core'
        }
      }
    ];
    this.isInitialized = true;
  }

  /**
   * Search knowledge base for relevant information using Supabase database
   */
  async searchKnowledge(query: RAGQuery): Promise<RAGResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initializeKnowledgeBase();
      }

      // Search Supabase database for relevant documentation
      const supabaseResults = await this.searchSupabaseDocumentation(query);

      // Combine with hardcoded chunks for fallback
      const hardcodedResults = this.documentChunks
        .map(chunk => ({
          content: chunk.content,
          source: chunk.metadata.source,
          relevanceScore: this.calculateRelevance(query.query, chunk.content),
          metadata: chunk.metadata
        }))
        .filter(result => result.relevanceScore > 0.1);

      // Merge and sort all results
      const allResults = [...supabaseResults, ...hardcodedResults]
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, query.maxResults || 5);

      logger.info(`RAG search found ${allResults.length} results for query: ${query.query}`);
      return allResults;
    } catch (error) {
      logger.error('Error searching knowledge base:', error);
      return [];
    }
  }

  /**
   * Search Supabase n8n documentation database
   */
  private async searchSupabaseDocumentation(query: RAGQuery): Promise<RAGResult[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('n8n_documentation')
        .select('title, content, source_url, category, subcategory, metadata, tokens, snippet_type')
        .textSearch('content', query.query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(query.maxResults || 10);

      if (error) {
        logger.error('Error searching Supabase documentation:', error);
        return [];
      }

      if (!data || data.length === 0) {
        logger.info('No results found in Supabase documentation');
        return [];
      }

      // Convert Supabase results to RAGResult format
      const results: RAGResult[] = data.map(doc => ({
        content: doc.content,
        source: doc.source_url || 'n8n-documentation',
        relevanceScore: this.calculateRelevance(query.query, doc.content),
        metadata: {
          title: doc.title,
          category: doc.category,
          subcategory: doc.subcategory,
          snippet_type: doc.snippet_type,
          tokens: doc.tokens,
          source: 'supabase-database',
          ...doc.metadata
        }
      }));

      logger.info(`Found ${results.length} results from Supabase documentation`);
      return results.filter(result => result.relevanceScore > 0.1);
    } catch (error) {
      logger.error('Error in Supabase documentation search:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score (simple keyword matching)
   * In production, this would use vector embeddings
   */
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const queryWord of queryWords) {
      if (contentWords.some(contentWord => contentWord.includes(queryWord))) {
        matches++;
      }
    }
    
    return matches / queryWords.length;
  }

  /**
   * Get documentation for specific n8n node
   */
  async getNodeDocumentation(nodeType: string): Promise<RAGResult[]> {
    return this.searchKnowledge({
      query: nodeType,
      nodeType,
      maxResults: 3
    });
  }

  /**
   * Get best practices for specific category
   */
  async getBestPractices(category: string): Promise<RAGResult[]> {
    return this.searchKnowledge({
      query: category,
      category: 'practices',
      maxResults: 5
    });
  }
}

export const ragService = RAGService.getInstance();
