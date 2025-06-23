// Enhanced Workflow Template Service for NodePilot AI Training
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  prompt_example: string;
  workflow_json: any;
  keywords: string[];
  use_cases: string[];
  complexity_level: number;
  nodes_used: string[];
  integrations: string[];
  estimated_setup_time?: number;
  quality_score: number;
  usage_count: number;
  success_rate: number;
  is_active: boolean;
  is_featured: boolean;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface TemplateMatchResult {
  template: WorkflowTemplate;
  matchScore: number;
  matchReasons: string[];
}

export interface TemplateSearchOptions {
  category?: string;
  keywords?: string[];
  complexity_level?: number;
  integrations?: string[];
  limit?: number;
  featured_only?: boolean;
}

class WorkflowTemplateService {
  private supabase;
  private initialized = false;
  private templateCache: Map<string, WorkflowTemplate> = new Map();
  private categoryCache: Map<string, any> = new Map();

  constructor() {
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load templates into cache
      await this.refreshTemplateCache();
      await this.refreshCategoryCache();
      
      this.initialized = true;
      logger.info('Workflow Template Service initialized successfully');
    } catch (error) {
      logger.error('Error initializing Workflow Template Service', { error });
      throw error;
    }
  }

  // Template Management Methods
  async createTemplate(template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'success_rate'>): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_templates')
        .insert([{
          ...template,
          usage_count: 0,
          success_rate: 100.00
        }])
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.templateCache.set(data.id, data);
      
      logger.info('Template created successfully', { templateId: data.id, name: template.name });
      return data;
    } catch (error) {
      logger.error('Error creating template', { error, templateName: template.name });
      throw error;
    }
  }

  async getTemplateById(id: string): Promise<WorkflowTemplate | null> {
    try {
      // Check cache first
      if (this.templateCache.has(id)) {
        return this.templateCache.get(id)!;
      }

      const { data, error } = await this.supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Update cache
      this.templateCache.set(data.id, data);
      return data;
    } catch (error) {
      logger.error('Error fetching template by ID', { error, templateId: id });
      return null;
    }
  }

  async searchTemplates(options: TemplateSearchOptions = {}): Promise<WorkflowTemplate[]> {
    try {
      let query = this.supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true);

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.complexity_level) {
        query = query.eq('complexity_level', options.complexity_level);
      }

      if (options.featured_only) {
        query = query.eq('is_featured', true);
      }

      if (options.keywords && options.keywords.length > 0) {
        query = query.overlaps('keywords', options.keywords);
      }

      if (options.integrations && options.integrations.length > 0) {
        query = query.overlaps('integrations', options.integrations);
      }

      query = query
        .order('quality_score', { ascending: false })
        .order('usage_count', { ascending: false })
        .limit(options.limit || 50);

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error searching templates', { error, options });
      return [];
    }
  }

  // AI Training Methods
  async findBestTemplateMatches(userPrompt: string, limit: number = 5): Promise<TemplateMatchResult[]> {
    try {
      if (!this.initialized) await this.initialize();

      const templates = await this.searchTemplates({ limit: 100 });
      const matches: TemplateMatchResult[] = [];

      for (const template of templates) {
        const matchResult = this.calculateTemplateMatch(userPrompt, template);
        if (matchResult.matchScore > 20) { // Only include reasonable matches
          matches.push(matchResult);
        }
      }

      // Sort by match score and return top matches
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error finding template matches', { error, userPrompt });
      return [];
    }
  }

  private calculateTemplateMatch(userPrompt: string, template: WorkflowTemplate): TemplateMatchResult {
    let score = 0;
    const reasons: string[] = [];
    const promptLower = userPrompt.toLowerCase();

    // Keyword matching (40% weight)
    const keywordMatches = template.keywords.filter(keyword => 
      promptLower.includes(keyword.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      const keywordScore = (keywordMatches.length / template.keywords.length) * 40;
      score += keywordScore;
      reasons.push(`Keywords matched: ${keywordMatches.join(', ')}`);
    }

    // Use case matching (30% weight)
    const useCaseMatches = template.use_cases.filter(useCase =>
      promptLower.includes(useCase.toLowerCase()) || 
      useCase.toLowerCase().includes(promptLower.split(' ').find(word => word.length > 3) || '')
    );
    if (useCaseMatches.length > 0) {
      const useCaseScore = (useCaseMatches.length / template.use_cases.length) * 30;
      score += useCaseScore;
      reasons.push(`Use cases matched: ${useCaseMatches.join(', ')}`);
    }

    // Integration matching (20% weight)
    const integrationMatches = template.integrations.filter(integration =>
      promptLower.includes(integration.toLowerCase())
    );
    if (integrationMatches.length > 0) {
      const integrationScore = (integrationMatches.length / template.integrations.length) * 20;
      score += integrationScore;
      reasons.push(`Integrations matched: ${integrationMatches.join(', ')}`);
    }

    // Description similarity (10% weight)
    const descriptionWords = template.description.toLowerCase().split(' ');
    const promptWords = promptLower.split(' ');
    const commonWords = descriptionWords.filter(word => 
      word.length > 3 && promptWords.includes(word)
    );
    if (commonWords.length > 0) {
      const descriptionScore = (commonWords.length / Math.max(descriptionWords.length, promptWords.length)) * 10;
      score += descriptionScore;
      reasons.push(`Description similarity: ${commonWords.length} common words`);
    }

    // Quality bonus
    score *= (template.quality_score / 10);

    return {
      template,
      matchScore: Math.round(score * 100) / 100,
      matchReasons: reasons
    };
  }

  // Analytics and Tracking
  async recordTemplateUsage(
    templateId: string, 
    userId: string, 
    userPrompt: string, 
    matchScore: number,
    wasSuccessful: boolean,
    workflowGenerationId?: string,
    generationTimeMs?: number,
    modificationsNeeded?: string[]
  ): Promise<void> {
    try {
      // Record usage analytics
      await this.supabase
        .from('template_usage_analytics')
        .insert([{
          template_id: templateId,
          user_id: userId,
          workflow_generation_id: workflowGenerationId,
          user_prompt: userPrompt,
          match_score: matchScore,
          was_successful: wasSuccessful,
          generation_time_ms: generationTimeMs,
          modifications_needed: modificationsNeeded || []
        }]);

      // Update template usage count and success rate
      const { data: currentTemplate } = await this.supabase
        .from('workflow_templates')
        .select('usage_count, success_rate')
        .eq('id', templateId)
        .single();

      if (currentTemplate) {
        const newUsageCount = currentTemplate.usage_count + 1;
        const currentSuccessCount = Math.round((currentTemplate.success_rate / 100) * currentTemplate.usage_count);
        const newSuccessCount = currentSuccessCount + (wasSuccessful ? 1 : 0);
        const newSuccessRate = (newSuccessCount / newUsageCount) * 100;

        await this.supabase
          .from('workflow_templates')
          .update({
            usage_count: newUsageCount,
            success_rate: newSuccessRate,
            last_used_at: new Date().toISOString()
          })
          .eq('id', templateId);

        // Update cache
        const cachedTemplate = this.templateCache.get(templateId);
        if (cachedTemplate) {
          cachedTemplate.usage_count = newUsageCount;
          cachedTemplate.success_rate = newSuccessRate;
          cachedTemplate.last_used_at = new Date().toISOString();
        }
      }

      logger.info('Template usage recorded', { 
        templateId, 
        userId, 
        wasSuccessful, 
        matchScore 
      });
    } catch (error) {
      logger.error('Error recording template usage', { error, templateId, userId });
    }
  }

  // Cache Management
  private async refreshTemplateCache(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true);

      if (error) throw error;

      this.templateCache.clear();
      data?.forEach(template => {
        this.templateCache.set(template.id, template);
      });

      logger.info(`Template cache refreshed with ${data?.length || 0} templates`);
    } catch (error) {
      logger.error('Error refreshing template cache', { error });
      throw error;
    }
  }

  private async refreshCategoryCache(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('template_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      this.categoryCache.clear();
      data?.forEach(category => {
        this.categoryCache.set(category.name, category);
      });

      logger.info(`Category cache refreshed with ${data?.length || 0} categories`);
    } catch (error) {
      logger.error('Error refreshing category cache', { error });
      throw error;
    }
  }

  // Utility Methods
  async getCategories(): Promise<any[]> {
    if (!this.initialized) await this.initialize();
    return Array.from(this.categoryCache.values());
  }

  async getTemplatesByCategory(category: string): Promise<WorkflowTemplate[]> {
    return this.searchTemplates({ category });
  }

  async getFeaturedTemplates(limit: number = 10): Promise<WorkflowTemplate[]> {
    return this.searchTemplates({ featured_only: true, limit });
  }
}

export const workflowTemplateService = new WorkflowTemplateService();
