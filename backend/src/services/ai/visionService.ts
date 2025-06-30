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
   * Analyze workflow image using GPT-4 Vision
   */
  async analyzeWorkflowImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    try {
      logger.info('Analyzing workflow image with GPT-4 Vision', { userId: request.userId });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // GPT-4 with vision capabilities
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are an expert in n8n workflow analysis. Analyze the provided workflow image and extract:
            1. All visible nodes and their types
            2. Node connections and flow
            3. Node positions (approximate)
            4. Any visible parameters or configurations
            5. Overall workflow purpose and description
            
            Return your analysis in this JSON format:
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
            role: "user",
            content: [
              {
                type: "text",
                text: request.prompt || "Analyze this n8n workflow image and extract all nodes, connections, and configurations."
              },
              {
                type: "image_url",
                image_url: {
                  url: request.imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ]
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from GPT-4 Vision');
      }

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
        logger.warn('Failed to parse vision analysis as JSON, using text analysis');
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
   * Check if image is a valid workflow screenshot
   */
  async validateWorkflowImage(imageUrl: string): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 100,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: "Determine if this image shows an n8n workflow. Respond with only 'true' or 'false'."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Is this an n8n workflow image?"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "low"
                }
              }
            ]
          }
        ]
      });

      const content = response.choices[0].message.content?.toLowerCase().trim();
      return content === 'true';
    } catch (error) {
      logger.error('Error validating workflow image:', error);
      return false;
    }
  }
}

export const visionService = VisionService.getInstance();
