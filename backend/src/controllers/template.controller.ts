// src/controllers/template.controller.ts
import { Request, Response } from 'express';
import { templateService } from '../services/templates/templateService';
import { logger } from '../utils/logger';

class TemplateController {
  /**
   * Get all templates
   */
  async getAllTemplates(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const templates = await templateService.getAllTemplates();
      return res.status(200).json({ templates });
    } catch (error) {
      logger.error('Error fetching templates:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all template categories
   */
  async getAllCategories(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const categories = await templateService.getAllCategories();
      return res.status(200).json({ categories });
    } catch (error) {
      logger.error('Error fetching template categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const templates = await templateService.getTemplatesByCategory(id);
      return res.status(200).json({ templates });
    } catch (error) {
      logger.error('Error fetching templates by category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await templateService.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      return res.status(200).json({ template });
    } catch (error) {
      logger.error('Error fetching template by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const { name, description, category, nodeType, config } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name || !category || !nodeType || !config) {
        return res.status(400).json({ error: 'Missing required template fields' });
      }

      const newTemplate = await templateService.createTemplate({
        name,
        description,
        category,
        nodeType,
        config,
        createdBy: userId
      });

      return res.status(201).json({ template: newTemplate });
    } catch (error) {
      logger.error('Error creating template:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, category, config } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await templateService.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      // Check if user is allowed to update this template
      if (template.isDefault) {
        return res.status(403).json({ error: 'Cannot update default templates' });
      }
      
      if (template.createdBy && template.createdBy !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this template' });
      }

      const updatedTemplate = await templateService.updateTemplate(id, {
        name,
        description,
        category,
        config
      });

      return res.status(200).json({ template: updatedTemplate });
    } catch (error) {
      logger.error('Error updating template:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await templateService.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      // Check if user is allowed to delete this template
      if (template.isDefault) {
        return res.status(403).json({ error: 'Cannot delete default templates' });
      }
      
      if (template.createdBy && template.createdBy !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this template' });
      }

      const success = await templateService.deleteTemplate(id);

      if (!success) {
        return res.status(500).json({ error: 'Failed to delete template' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error deleting template:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const templateController = new TemplateController();
