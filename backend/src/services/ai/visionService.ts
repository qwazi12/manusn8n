// src/services/ai/visionService.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export interface ImageAnalysisRequest {
  imageUrl: string;
  imageType: string;
  prompt?: string;
  userId: string;
}

export interface ImageAnalysisResult {
  workflowDescription: string;
  extractedNodes: Array<{
    type: string;
    name: string;
    position?: { x: number; y: number };
    parameters?: Record<string, any>;
  }>;
  connections: Array<{
    source: string;
    target: string;
  }>;
  confidence: number;
  rawAnalysis: string;
}

export interface WorkflowFromImageRequest {
  imageUrl: string;
  imageType: string;
  userId: string;
  additionalContext?: string;
}

export interface WorkflowFromImageResponse {
  workflow: any;
  analysis: ImageAnalysisResult;
  status: 'completed' | 'failed';
  message: string;
}

// OpenAI Responses API types
interface ResponseOutput {
  type: string;
  id?: string;
  status?: string;
  role?: string;
  content?: Array<{
    type: string;
    text?: string;
    annotations?: any[];
  }>;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created_at: number;
  status: string;
  model: string;
  output: ResponseOutput[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

class VisionService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private static instance: VisionService;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
    
    logger.info('Vision service initialized');
  }

  public static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  /**
   * Analyze workflow image using latest OpenAI Responses API with GPT-4.1
   */
  async analyzeWorkflowImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    try {
      logger.info('Analyzing workflow image with GPT-4.1 Vision (Responses API)', { userId: request.userId });

      // Use the new Responses API with GPT-4.1 for better vision capabilities
      const response = await this.openai.responses.create({
        model: "gpt-4.1-mini", // Latest model with vision capabilities
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `You are an expert in n8n workflow analysis. Analyze this workflow image and extract:
                1. All visible nodes and their types (identify specific n8n node types like HttpRequest, Set, Manual Trigger, etc.)
                2. Node connections and flow direction
                3. Node positions (approximate x,y coordinates)
                4. Any visible parameters or configurations
                5. Overall workflow purpose and description

                ${request.prompt || "Analyze this n8n workflow image and extract all nodes, connections, and configurations."}

                Return your analysis in this exact JSON format:
                {
                  "workflowDescription": "Brief description of what this workflow does",
                  "extractedNodes": [
                    {
                      "type": "n8n-nodes-base.nodeType",
                      "name": "Node Name",
                      "position": {"x": 100, "y": 200},
                      "parameters": {}
                    }
                  ],
                  "connections": [
                    {"source": "Node 1", "target": "Node 2"}
                  ],
                  "confidence": 0.85,
                  "rawAnalysis": "Detailed analysis of what you see"
                }`
              },
              {
                type: "input_image",
                image_url: request.imageUrl,
                detail: "high" // Use high detail for precise node identification
              }
            ]
          }
        ]
      });

      // Extract content from the new Responses API format
      // The response.output is an array of output items
      const messageOutput = response.output.find(item => item.type === 'message');
      if (!messageOutput || !messageOutput.content) {
        throw new Error('No message content received from GPT-4.1 Vision');
      }

      // Get the text content from the message
      const textContent = messageOutput.content.find(item => item.type === 'output_text');
      if (!textContent || !textContent.text) {
        throw new Error('No text content found in GPT-4.1 Vision response');
      }

      const content = textContent.text;
      logger.info('GPT-4.1 Vision analysis received', {
        userId: request.userId,
        contentLength: content.length,
        responseStatus: response.status,
        model: response.model
      });

      // Try to parse JSON response
      try {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        const analysis = JSON.parse(jsonString);

        return {
          workflowDescription: analysis.workflowDescription || 'Workflow extracted from image',
          extractedNodes: analysis.extractedNodes || [],
          connections: analysis.connections || [],
          confidence: analysis.confidence || 0.7,
          rawAnalysis: analysis.rawAnalysis || content
        };
      } catch (parseError) {
        logger.warn('Failed to parse vision analysis as JSON, using text analysis', {
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          contentPreview: content.substring(0, 200)
        });
        return {
          workflowDescription: 'Workflow extracted from image',
          extractedNodes: [],
          connections: [],
          confidence: 0.5,
          rawAnalysis: content
        };
      }
    } catch (error) {
      logger.error('Error analyzing workflow image:', error);
      throw error;
    }
  }

  /**
   * Generate n8n workflow JSON from image analysis
   */
  async generateWorkflowFromImage(request: WorkflowFromImageRequest): Promise<WorkflowFromImageResponse> {
    try {
      logger.info('Generating workflow from image', { userId: request.userId });

      // Step 1: Analyze the image
      const analysis = await this.analyzeWorkflowImage({
        imageUrl: request.imageUrl,
        imageType: request.imageType,
        userId: request.userId,
        prompt: `Analyze this n8n workflow image and extract all nodes, connections, and configurations. ${request.additionalContext || ''}`
      });

      // Step 2: Generate n8n workflow JSON using Claude
      const workflowPrompt = `Based on this workflow analysis from an image, generate a complete n8n 1.100.1 compatible workflow JSON:

Workflow Description: ${analysis.workflowDescription}

Extracted Nodes:
${analysis.extractedNodes.map(node => `- ${node.name} (${node.type}) at position ${node.position?.x || 0}, ${node.position?.y || 0}`).join('\n')}

Connections:
${analysis.connections.map(conn => `- ${conn.source} → ${conn.target}`).join('\n')}

Raw Analysis:
${analysis.rawAnalysis}

Generate a complete n8n workflow JSON that recreates this exact workflow structure. Use:
- typeVersion 3 for HttpRequest nodes
- typeVersion 3 for Set nodes  
- typeVersion 1 for Manual Trigger nodes
- Proper parameter structures for n8n 1.100.1 compatibility

Return only the JSON workflow structure.`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        system: `You are an expert in n8n workflows. Generate a complete n8n 1.100.1 compatible workflow JSON based on the image analysis provided. Ensure all nodes have proper typeVersions and parameter structures to prevent "Could not find property option" errors.`,
        messages: [
          {
            role: "user",
            content: workflowPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the workflow JSON
      try {
        const jsonMatch = content.text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content.text;
        const workflow = JSON.parse(jsonString);

        return {
          workflow,
          analysis,
          status: 'completed',
          message: 'Workflow successfully generated from image'
        };
      } catch (parseError) {
        logger.error('Failed to parse workflow JSON from Claude response:', parseError);
        return {
          workflow: null,
          analysis,
          status: 'failed',
          message: 'Failed to generate valid workflow JSON from image analysis'
        };
      }
    } catch (error) {
      logger.error('Error generating workflow from image:', error);
      return {
        workflow: null,
        analysis: {
          workflowDescription: 'Failed to analyze image',
          extractedNodes: [],
          connections: [],
          confidence: 0,
          rawAnalysis: error instanceof Error ? error.message : 'Unknown error'
        },
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if image is a valid workflow screenshot using GPT-4.1
   */
  async validateWorkflowImage(imageUrl: string): Promise<boolean> {
    try {
      const response = await this.openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Look at this image and determine if it shows an n8n workflow interface. Look for: workflow canvas, connected nodes, n8n interface elements. Respond with only 'true' if it's an n8n workflow, or 'false' if it's not."
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "low" // Low detail is sufficient for validation
              }
            ]
          }
        ]
      });

      // Extract content from the new Responses API format
      const messageOutput = response.output.find(item => item.type === 'message');
      if (!messageOutput || !messageOutput.content) {
        logger.warn('No message content in validation response');
        return false;
      }

      const textContent = messageOutput.content.find(item => item.type === 'output_text');
      if (!textContent || !textContent.text) {
        logger.warn('No text content in validation response');
        return false;
      }

      const content = textContent.text.toLowerCase().trim();
      const isValid = content === 'true' || content.includes('true');

      logger.info('Workflow image validation result', {
        isValid,
        response: content.substring(0, 100),
        responseStatus: response.status
      });

      return isValid;
    } catch (error) {
      logger.error('Error validating workflow image:', error);
      return false;
    }
  }
}

export const visionService = VisionService.getInstance();
