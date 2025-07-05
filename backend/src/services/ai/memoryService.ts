// src/services/ai/memoryService.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/config';
import { supabaseService } from '../database/supabaseService';
import { logger } from '../../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export interface Memory {
  id?: string;
  userId: string;
  content: string;
  label: string;
  score: number;
  createdAt?: Date;
  conversationContext?: string;
}

export interface MemoryEvaluation {
  memory: string;
  explanation: string;
  score: number;
}

class MemoryService {
  private anthropic: Anthropic;
  private static instance: MemoryService;
  private memoryPrompt: string = '';
  private ratingPrompt: string = '';

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
    
    this.initializePrompts();
    logger.info('Memory service initialized');
  }

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  /**
   * Initialize memory prompts
   */
  private async initializePrompts(): Promise<void> {
    try {
      const promptsDir = path.join(__dirname, '../../ai_prompts');
      
      // Load memory prompts
      try {
        this.memoryPrompt = await fs.readFile(
          path.join(promptsDir, 'nodepilot_ai_memory_prompt.txt'), 
          'utf-8'
        );
        this.ratingPrompt = await fs.readFile(
          path.join(promptsDir, 'nodepilot_ai_memory_rating_prompt.txt'), 
          'utf-8'
        );
        logger.info('Memory prompts loaded successfully');
      } catch (error) {
        logger.warn('Could not load memory prompt files, using fallbacks');
        this.setFallbackPrompts();
      }
    } catch (error) {
      logger.error('Error initializing memory prompts:', error);
      this.setFallbackPrompts();
    }
  }

  /**
   * Set fallback memory prompts
   */
  private setFallbackPrompts(): void {
    this.memoryPrompt = `You are an AI Assistant for NodePilot, specializing in n8n workflow generation, and you are judging whether or not certain memories are worth remembering.

A memory is worthy of being remembered if it is:
- Relevant to the domain of n8n workflow generation and automation
- General and applicable to future n8n workflow interactions
- SPECIFIC and ACTIONABLE - vague preferences or observations should be scored low (Score: 1-2)
- Not a specific n8n workflow task detail, one-off request, or implementation specifics of a single workflow (Score: 1)

Score from 1 to 5 where:
1-2: Poor (specific details, obvious facts, vague preferences)
3: Neutral (borderline useful)
4-5: Excellent (actionable preferences, general workflow principles)

Provide justification and return score as "SCORE: [score]"`;

    this.ratingPrompt = `You are given a conversation between a user and the NodePilot AI assistant.
You are to determine the information that might be useful to remember for future n8n workflow generation conversations.

Include:
- High-level preferences about how the user likes n8n workflows to be structured (MUST be specific and actionable)
- General patterns or approaches the user prefers for n8n workflow design
- Specific technical preferences related to n8n (e.g., preferred node types, error handling strategies)
- Common pain points or frustrations to avoid in n8n workflow generation

Return in JSON format:
{
  "explanation": "Why this memory is valuable for future n8n workflow generation",
  "memory": "preference-name: The general preference or approach to remember"
}

If no memory is needed, return exactly: "no_memory_needed"`;
  }

  /**
   * Extract potential memory from conversation
   */
  async extractMemory(conversationContext: string, userId: string): Promise<string | null> {
    try {
      const message = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        temperature: 0.3,
        system: this.ratingPrompt,
        messages: [
          {
            role: "user",
            content: `Analyze this conversation for potential memories:\n\n${conversationContext}`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        return null;
      }

      const response = content.text.trim();
      
      if (response === 'no_memory_needed') {
        return null;
      }

      try {
        const memoryData = JSON.parse(response);
        if (memoryData.memory && memoryData.explanation) {
          return memoryData.memory;
        }
      } catch (parseError) {
        logger.warn('Could not parse memory extraction response');
      }

      return null;
    } catch (error) {
      logger.error('Error extracting memory:', error);
      return null;
    }
  }

  /**
   * Rate a memory for worthiness (1-5 scale)
   */
  async rateMemory(memory: string, conversationContext: string): Promise<MemoryEvaluation | null> {
    try {
      const prompt = this.memoryPrompt
        .replace('${l}', conversationContext)
        .replace('${a.memory}', memory)
        .replace('${c}', '');

      const message = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        temperature: 0.3,
        system: prompt,
        messages: [
          {
            role: "user",
            content: `Rate this memory: "${memory}"`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        return null;
      }

      const response = content.text;
      
      // Extract score
      const scoreMatch = response.match(/SCORE:\s*(\d+)/);
      if (!scoreMatch) {
        return null;
      }

      const score = parseInt(scoreMatch[1]);
      
      // Extract explanation (everything before the score)
      const explanation = response.split('SCORE:')[0].trim();

      return {
        memory,
        explanation,
        score
      };
    } catch (error) {
      logger.error('Error rating memory:', error);
      return null;
    }
  }

  /**
   * Process conversation and potentially store memory
   */
  async processConversation(conversationContext: string, userId: string): Promise<Memory | null> {
    try {
      // Step 1: Extract potential memory
      const potentialMemory = await this.extractMemory(conversationContext, userId);
      if (!potentialMemory) {
        return null;
      }

      // Step 2: Rate the memory
      const evaluation = await this.rateMemory(potentialMemory, conversationContext);
      if (!evaluation || evaluation.score < 4) {
        logger.info('Memory scored too low to store', { score: evaluation?.score });
        return null;
      }

      // Step 3: Store high-quality memory
      const memory: Memory = {
        userId,
        content: evaluation.memory,
        label: this.generateLabel(evaluation.memory),
        score: evaluation.score,
        conversationContext: conversationContext.substring(0, 1000) // Truncate for storage
      };

      const savedMemory = await this.storeMemory(memory);
      logger.info('Memory stored successfully', { userId, score: evaluation.score });
      
      return savedMemory;
    } catch (error) {
      logger.error('Error processing conversation for memory:', error);
      return null;
    }
  }

  /**
   * Generate a label for the memory
   */
  private generateLabel(memory: string): string {
    // Extract the prefix before the colon, or generate one
    const colonIndex = memory.indexOf(':');
    if (colonIndex > 0) {
      return memory.substring(0, colonIndex).toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    
    // Generate label from first few words
    return memory
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .slice(0, 3)
      .join('-');
  }

  /**
   * Store memory in database
   */
  private async storeMemory(memory: Memory): Promise<Memory> {
    try {
      const memoryData = {
        user_id: memory.userId,
        content: memory.content,
        label: memory.label,
        score: memory.score,
        conversation_context: memory.conversationContext,
        memory_type: this.determineMemoryType(memory.content)
      };

      const storedMemory = await supabaseService.storeMemory(memoryData);

      return {
        id: storedMemory.id,
        userId: storedMemory.user_id,
        content: storedMemory.content,
        label: storedMemory.label,
        score: storedMemory.score,
        createdAt: new Date(storedMemory.created_at),
        conversationContext: storedMemory.conversation_context
      };
    } catch (error) {
      logger.error('Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Retrieve memories for a user
   */
  async getUserMemories(userId: string): Promise<Memory[]> {
    try {
      const memories = await supabaseService.getUserMemories(userId);

      return memories.map(memory => ({
        id: memory.id,
        userId: memory.user_id,
        content: memory.content,
        label: memory.label,
        score: memory.score,
        createdAt: new Date(memory.created_at),
        conversationContext: memory.conversation_context
      }));
    } catch (error) {
      logger.error('Error retrieving user memories:', error);
      return [];
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userId: string): Promise<boolean> {
    try {
      await supabaseService.deleteMemory(memoryId, userId);
      return true;
    } catch (error) {
      logger.error('Error deleting memory:', error);
      return false;
    }
  }

  /**
   * Determine memory type based on content
   */
  private determineMemoryType(content: string): string {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('prefer') || lowerContent.includes('always') || lowerContent.includes('never')) {
      return 'preference';
    } else if (lowerContent.includes('pattern') || lowerContent.includes('approach')) {
      return 'pattern';
    } else if (lowerContent.includes('frustrat') || lowerContent.includes('annoyed') || lowerContent.includes('wrong')) {
      return 'frustration';
    } else if (lowerContent.includes('correct') || lowerContent.includes('fix') || lowerContent.includes('should')) {
      return 'correction';
    }

    return 'preference'; // Default
  }
}

export const memoryService = MemoryService.getInstance();
