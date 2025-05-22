"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowService = void 0;
// src/services/workflow/workflowService.ts
const aiService_1 = require("../ai/aiService");
const cacheService_1 = require("../cache/cacheService");
const creditService_1 = require("../credit/creditService");
const supabaseService_1 = require("../database/supabaseService");
const logger_1 = require("../../utils/logger");
class WorkflowService {
    constructor() {
        logger_1.logger.info('Workflow service initialized');
    }
    static getInstance() {
        if (!WorkflowService.instance) {
            WorkflowService.instance = new WorkflowService();
        }
        return WorkflowService.instance;
    }
    /**
     * Generate a workflow based on user prompt
     */
    async generateWorkflow(request) {
        try {
            const { prompt, userId, files = [], useCache = true } = request;
            // Check if user has sufficient credits
            const hasSufficientCredits = await creditService_1.creditService.hasSufficientCredits(userId);
            if (!hasSufficientCredits) {
                return {
                    workflow: null,
                    status: 'failed',
                    message: 'Insufficient credits',
                    remainingCredits: (await creditService_1.creditService.getUserCredits(userId)).credits
                };
            }
            // Check cache if enabled
            if (useCache) {
                const cacheKey = cacheService_1.cacheService.generateWorkflowCacheKey(prompt, userId);
                const cachedWorkflow = await cacheService_1.cacheService.get(cacheKey);
                if (cachedWorkflow) {
                    logger_1.logger.info('Workflow found in cache', { userId });
                    // Still deduct credits for cached workflows
                    const { credits } = await creditService_1.creditService.getUserCredits(userId);
                    return {
                        workflow: cachedWorkflow.workflow,
                        status: cachedWorkflow.status,
                        message: 'Retrieved from cache',
                        remainingCredits: credits
                    };
                }
            }
            // Generate workflow using AI service
            const aiRequest = {
                prompt,
                userId,
                files
            };
            const generatedWorkflow = await aiService_1.aiService.generateWorkflow(aiRequest);
            // Save workflow to database
            const workflowData = {
                user_id: userId,
                prompt,
                json: generatedWorkflow.workflow,
                status: generatedWorkflow.status,
                credits_used: 1,
                file_urls: files
            };
            const savedWorkflow = await supabaseService_1.supabaseService.saveWorkflow(workflowData);
            // Deduct credits
            const updatedCredits = await creditService_1.creditService.deductCreditsForWorkflow(userId, savedWorkflow.id, 1);
            // Cache the result if successful
            if (generatedWorkflow.status === 'completed' && useCache) {
                const cacheKey = cacheService_1.cacheService.generateWorkflowCacheKey(prompt, userId);
                await cacheService_1.cacheService.set(cacheKey, generatedWorkflow, { ttl: 86400 }); // Cache for 24 hours
            }
            return {
                workflow: generatedWorkflow.workflow,
                workflowId: savedWorkflow.id,
                status: generatedWorkflow.status,
                message: generatedWorkflow.message,
                remainingCredits: updatedCredits.credits
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating workflow', { error, userId: request.userId });
            throw error;
        }
    }
    /**
     * Get workflows by user ID
     */
    async getWorkflowsByUserId(userId) {
        try {
            return await supabaseService_1.supabaseService.getWorkflowsByUserId(userId);
        }
        catch (error) {
            logger_1.logger.error('Error getting workflows by user ID', { error, userId });
            throw error;
        }
    }
}
exports.workflowService = WorkflowService.getInstance();
