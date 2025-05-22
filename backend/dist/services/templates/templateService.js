"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateService = void 0;
const logger_1 = require("../../utils/logger");
const defaultTemplates_1 = require("./defaultTemplates");
class TemplateService {
    constructor() {
        this.templates = [];
        this.categories = [];
        this.initialized = false;
        logger_1.logger.info('Template service initialized');
        this.initialize();
    }
    static getInstance() {
        if (!TemplateService.instance) {
            TemplateService.instance = new TemplateService();
        }
        return TemplateService.instance;
    }
    /**
     * Initialize template service with default templates
     */
    async initialize() {
        try {
            // Load default templates
            this.templates = [...defaultTemplates_1.defaultTemplates];
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
            logger_1.logger.info('Template service initialized with default templates');
        }
        catch (error) {
            logger_1.logger.error('Error initializing template service', { error });
            // Continue with default templates
            this.initialized = true;
        }
    }
    /**
     * Get all templates
     */
    async getAllTemplates() {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.templates;
    }
    /**
     * Get templates by category
     */
    async getTemplatesByCategory(categoryId) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.templates.filter(template => template.category === categoryId);
    }
    /**
     * Get template by ID
     */
    async getTemplateById(templateId) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.templates.find(template => template.id === templateId) || null;
    }
    /**
     * Create a new template
     */
    async createTemplate(template) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            const newTemplate = {
                ...template,
                id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                isDefault: false
            };
            // PLACEHOLDER: Save template to database
            // INTEGRATION: This should save the template to Supabase
            // Add to local cache
            this.templates.push(newTemplate);
            return newTemplate;
        }
        catch (error) {
            logger_1.logger.error('Error creating template', { error, template });
            throw error;
        }
    }
    /**
     * Update a template
     */
    async updateTemplate(templateId, updates) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            const templateIndex = this.templates.findIndex(t => t.id === templateId);
            if (templateIndex === -1)
                return null;
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
        }
        catch (error) {
            logger_1.logger.error('Error updating template', { error, templateId, updates });
            throw error;
        }
    }
    /**
     * Delete a template
     */
    async deleteTemplate(templateId) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            const templateIndex = this.templates.findIndex(t => t.id === templateId);
            if (templateIndex === -1)
                return false;
            // Don't allow deleting default templates
            if (this.templates[templateIndex].isDefault) {
                throw new Error('Cannot delete default templates');
            }
            // PLACEHOLDER: Delete template from database
            // INTEGRATION: This should delete the template from Supabase
            // Remove from local cache
            this.templates.splice(templateIndex, 1);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error deleting template', { error, templateId });
            throw error;
        }
    }
    /**
     * Get all categories
     */
    async getAllCategories() {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.categories;
    }
}
exports.templateService = TemplateService.getInstance();
