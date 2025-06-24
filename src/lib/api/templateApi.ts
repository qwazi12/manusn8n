// src/lib/api/templateApi.ts
import { apiClient } from './apiClient';

// Types for template API
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

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  nodeType: string;
  config: any;
}

// Template API methods
export const templateApi = {
  // Get all templates
  async getAllTemplates(): Promise<NodeTemplate[]> {
    const response = await apiClient.get<{ templates: NodeTemplate[] }>('/templates');
    return response.templates;
  },

  // Get all template categories
  async getAllCategories(): Promise<TemplateCategory[]> {
    const response = await apiClient.get<{ categories: TemplateCategory[] }>('/templates/categories');
    return response.categories;
  },

  // Get templates by category
  async getTemplatesByCategory(categoryId: string): Promise<NodeTemplate[]> {
    const response = await apiClient.get<{ templates: NodeTemplate[] }>(`/templates/category/${categoryId}`);
    return response.templates;
  },

  // Get template by ID
  async getTemplateById(templateId: string): Promise<NodeTemplate> {
    const response = await apiClient.get<{ template: NodeTemplate }>(`/templates/${templateId}`);
    return response.template;
  },

  // Create a new template
  async createTemplate(template: CreateTemplateRequest): Promise<NodeTemplate> {
    const response = await apiClient.post<{ template: NodeTemplate }>('/templates', template);
    return response.template;
  },

  // Update a template
  async updateTemplate(templateId: string, updates: Partial<CreateTemplateRequest>): Promise<NodeTemplate> {
    const response = await apiClient.put<{ template: NodeTemplate }>(`/templates/${templateId}`, updates);
    return response.template;
  },

  // Delete a template
  async deleteTemplate(templateId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/templates/${templateId}`);
    return response.success;
  }
};
