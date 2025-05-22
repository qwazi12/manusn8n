"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchController = void 0;
const batchService_1 = require("../services/batch/batchService");
const logger_1 = require("../utils/logger");
class BatchController {
    /**
     * Create a new batch job
     */
    async createBatchJob(req, res) {
        var _a;
        try {
            const { prompts, priority } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
                return res.status(400).json({ error: 'Prompts array is required' });
            }
            const jobId = batchService_1.batchService.addToBatch(userId, prompts, priority || 1);
            return res.status(200).json({
                jobId,
                message: 'Batch job created successfully',
                status: 'pending',
                promptCount: prompts.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating batch job:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Get batch job status
     */
    async getBatchJobStatus(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const job = batchService_1.batchService.getBatchJob(id);
            if (!job) {
                return res.status(404).json({ error: 'Batch job not found' });
            }
            // Ensure user can only access their own jobs
            if (job.userId !== userId) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            return res.status(200).json({
                jobId: job.id,
                status: job.status,
                promptCount: job.prompts.length,
                completedCount: job.results.length,
                results: job.status === 'completed' ? job.results : [],
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting batch job status:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Get all batch jobs for a user
     */
    async getUserBatchJobs(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const jobs = batchService_1.batchService.getUserBatchJobs(userId);
            // Map to response format
            const jobsResponse = jobs.map(job => ({
                jobId: job.id,
                status: job.status,
                promptCount: job.prompts.length,
                completedCount: job.results.length,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            }));
            return res.status(200).json({ jobs: jobsResponse });
        }
        catch (error) {
            logger_1.logger.error('Error getting user batch jobs:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.batchController = new BatchController();
