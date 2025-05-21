// src/services/templates/templateService.ts
import { supabaseService } from '../database/supabaseService';
import { logger } from '../../utils/logger';
import { defaultTemplates } from './defaultTemplates';

// Types for template operations
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeType: string;
  config: any;
  createdBy?: string;
  isDefault?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
}

class TemplateService {
  private static instance: TemplateService;
  private templates: NodeTemplate[] = [];
  private categories: TemplateCategory[] = [];
  private initialized: boolean = false;

  private constructor() {
    logger.info('Template service initialized');
    this.initialize();
  }

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Initialize template service with default templates
   */
  private async initialize(): Promise<void> {
    try {
      // Load default templates
      this.templates = [...defaultTemplates];
      
      // Set up default categories
      this.categories = [
        { id: 'api', name: 'API Integration', description: 'Templates for API integrations' },
        { id: 'data', name: 'Data Processing', description: 'Templates for data processing workflows' },
        { id: 'automation', name: 'Automation', description: 'Templates for automation tasks' },
        { id: 'notification', name: 'Notification', description: 'Templates for notification workflows' },
        { id: 'custom', name: 'Custom', description: 'Custom user templates' }
      ];
      
      // PLACEHOLDER: Load templates from database
      // INTEGRATION: This should fetch templates from Supabase
      
      // Mark as initialized
      this.initialized = true;
      logger.info('Template service initialized with default templates');
    } catch (error) {
      logger.error('Error initializing template service', { error });
      // Continue with default templates
      this.initialized = true;
    }
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<NodeTemplate[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.templates;
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(categoryId: string): Promise<NodeTemplate[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.templates.filter(template => template.category === categoryId);
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<NodeTemplate | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.templates.find(template => template.id === templateId) || null;
  }

  /**
   * Create a new template
   */
  async createTemplate(template: Omit<NodeTemplate, 'id'>): Promise<NodeTemplate> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const newTemplate: NodeTemplate = {
        ...template,
        id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        isDefault: false
      };
      
      // PLACEHOLDER: Save template to database
      // INTEGRATION: This should save the template to Supabase
      
      // Add to local cache
      this.templates.push(newTemplate);
      
      return newTemplate;
    } catch (error) {
      logger.error('Error creating template', { error, template });
      throw error;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId: string, updates: Partial<NodeTemplate>): Promise<NodeTemplate | null> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const templateIndex = this.templates.findIndex(t => t.id === templateId);
      if (templateIndex === -1) return null;
      
      // Don't allow updating default templates
      if (this.templates[templateIndex].isDefault) {
        throw new Error('Cannot update default templates');
      }
      
      // Update template
      const updatedTemplate = {
        ...this.templates[templateIndex],
        ...updates
      };
      
      // PLACEHOLDER: Update template in database
      // INTEGRATION: This should update the template in Supabase
      
      // Update local cache
      this.templates[templateIndex] = updatedTemplate;
      
      return updatedTemplate;
    } catch (error) {
      logger.error('Error updating template', { error, templateId, updates });
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const templateIndex = this.templates.findIndex(t => t.id === templateId);
      if (templateIndex === -1) return false;
      
      // Don't allow deleting default templates
      if (this.templates[templateIndex].isDefault) {
        throw new Error('Cannot delete default templates');
      }
      
      // PLACEHOLDER: Delete template from database
      // INTEGRATION: This should delete the template from Supabase
      
      // Remove from local cache
      this.templates.splice(templateIndex, 1);
      
      return true;
    } catch (error) {
      logger.error('Error deleting template', { error, templateId });
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<TemplateCategory[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.categories;
  }
}

export const templateService = TemplateService.getInstance();
