"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowController = void 0;
const workflowService_1 = require("../services/workflow/workflowService");
const logger_1 = require("../utils/logger");
class WorkflowController {
    /**
     * Generate a workflow based on user prompt
     */
    async generateWorkflow(req, res) {
        var _a;
        try {
            const { prompt, files, useCache } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await workflowService_1.workflowService.generateWorkflow({
                prompt,
                userId,
                files,
                useCache
            });
            if (result.status === 'failed' && result.message === 'Insufficient credits') {
                return res.status(403).json({
                    error: 'No credits remaining',
                    upgrade_url: '/pricing',
                    remaining_credits: result.remainingCredits
                });
            }
            return res.status(200).json({
                workflow: result.workflow,
                message: result.status === 'completed' ? 'success' : result.message,
                remaining_credits: result.remainingCredits,
                workflow_id: result.workflowId
            });
        }
        catch (error) {
            logger_1.logger.error('Workflow generation error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Get all workflows for a user
     */
    async getUserWorkflows(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const workflows = await workflowService_1.workflowService.getWorkflowsByUserId(userId);
            return res.status(200).json({ workflows });
        }
        catch (error) {
            logger_1.logger.error('Error fetching user workflows:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Get a specific workflow by ID
     */
    async getWorkflowById(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            // This would need to be implemented in the workflow service
            // For now, we'll return a placeholder response
            return res.status(501).json({ error: 'Not implemented yet' });
        }
        catch (error) {
            logger_1.logger.error('Error fetching workflow by ID:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.workflowController = new WorkflowController();
