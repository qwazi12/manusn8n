// src/services/database/supabaseService.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

class SupabaseService {
  private client: SupabaseClient;
  private static instance: SupabaseService;

  private constructor() {
    // PLACEHOLDER: Replace with your actual Supabase credentials
    // INTEGRATION: Sign up at https://supabase.com and create a new project
    this.client = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );

    logger.info('Supabase client initialized');
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  // User operations
  async getUserById(userId: string) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user by ID', { error, userId });
      throw error;
    }
  }

  async getUserByClerkId(clerkId: string) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user by Clerk ID', { error, clerkId });
      throw error;
    }
  }

  async updateUserCredits(userId: string, credits: number) {
    try {
      const { data, error } = await this.client
        .from('users')
        .update({ credits })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user credits', { error, userId, credits });
      throw error;
    }
  }

  async updateUserPlan(userId: string, planData: {
    plan: string;
    credits: number;
    trial_start?: string | null;
    plan_expiry?: string | null;
    subscription_id?: string | null;
  }) {
    try {
      const { data, error } = await this.client
        .from('users')
        .update(planData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user plan', { error, userId, planData });
      throw error;
    }
  }

  // Workflow operations
  async saveWorkflow(workflowData: any) {
    try {
      const { data, error } = await this.client
        .from('workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error saving workflow', { error, workflowData });
      throw error;
    }
  }

  async getWorkflowsByUserId(userId: string) {
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching workflows by user ID', { error, userId });
      throw error;
    }
  }

  // Credit history operations
  async recordCreditUsage(creditData: any) {
    try {
      const { data, error } = await this.client
        .from('credit_history')
        .insert(creditData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error recording credit usage', { error, creditData });
      throw error;
    }
  }

  async getCreditHistoryByUserId(userId: string) {
    try {
      const { data, error } = await this.client
        .from('credit_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching credit history by user ID', { error, userId });
      throw error;
    }
  }

  // AI Memory operations
  async storeMemory(memoryData: {
    user_id: string;
    content: string;
    label: string;
    score: number;
    conversation_context?: string;
    memory_type?: string;
  }) {
    try {
      const { data, error } = await this.client
        .from('ai_memories')
        .insert(memoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error storing memory', { error, memoryData });
      throw error;
    }
  }

  async getUserMemories(userId: string) {
    try {
      const { data, error } = await this.client
        .from('ai_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('score', 4) // Only get high-quality memories
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user memories', { error, userId });
      throw error;
    }
  }

  async deleteMemory(memoryId: string, userId: string) {
    try {
      const { data, error } = await this.client
        .from('ai_memories')
        .update({ is_active: false }) // Soft delete
        .eq('id', memoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error deleting memory', { error, memoryId, userId });
      throw error;
    }
  }

  async getMemoryById(memoryId: string, userId: string) {
    try {
      const { data, error } = await this.client
        .from('ai_memories')
        .select('*')
        .eq('id', memoryId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching memory by ID', { error, memoryId, userId });
      throw error;
    }
  }

  async updateMemoryScore(memoryId: string, userId: string, newScore: number) {
    try {
      const { data, error } = await this.client
        .from('ai_memories')
        .update({ score: newScore })
        .eq('id', memoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating memory score', { error, memoryId, userId, newScore });
      throw error;
    }
  }
}

export const supabaseService = SupabaseService.getInstance();
