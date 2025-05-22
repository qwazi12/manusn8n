"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchService = void 0;
// src/services/batch/batchService.ts
const workflowService_1 = require("../workflow/workflowService");
const logger_1 = require("../../utils/logger");
class BatchService {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.batchSize = 5;
        logger_1.logger.info('Batch service initialized');
        this.startProcessing();
    }
    static getInstance() {
        if (!BatchService.instance) {
            BatchService.instance = new BatchService();
        }
        return BatchService.instance;
    }
    /**
     * Add a batch job to the queue
     */
    addToBatch(userId, prompts, priority = 1) {
        const jobId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.queue.push({
            id: jobId,
            userId,
            prompts,
            priority,
            status: 'pending',
            results: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Sort queue by priority (higher number = higher priority)
        this.queue.sort((a, b) => b.priority - a.priority);
        logger_1.logger.info(`Added batch job for user ${userId} with ${prompts.length} prompts`, { jobId });
        return jobId;
    }
    /**
     * Get batch job status
     */
    getBatchJob(jobId) {
        const job = this.queue.find(job => job.id === jobId);
        return job || null;
    }
    /**
     * Get all batch jobs for a user
     */
    getUserBatchJobs(userId) {
        return this.queue.filter(job => job.userId === userId);
    }
    /**
     * Start processing the batch queue
     */
    async startProcessing() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        while (true) {
            if (this.queue.length === 0) {
                // No jobs in queue, sleep for a bit
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            // Get next batch job
            const job = this.queue[0];
            if (job.status === 'pending') {
                // Update job status
                job.status = 'processing';
                job.updatedAt = new Date();
                logger_1.logger.info(`Processing batch job ${job.id} for user ${job.userId}`);
                // Process prompts in parallel with limited concurrency
                const results = [];
                const chunks = this.chunkArray(job.prompts, this.batchSize);
                for (const chunk of chunks) {
                    const chunkPromises = chunk.map(prompt => this.processPrompt(job.userId, prompt)
                        .catch(error => {
                        logger_1.logger.error(`Error processing prompt in batch job ${job.id}`, { error, prompt });
                        return { error: error.message };
                    }));
                    const chunkResults = await Promise.all(chunkPromises);
                    results.push(...chunkResults);
                }
                // Update job with results
                job.results = results;
                job.status = 'completed';
                job.updatedAt = new Date();
                logger_1.logger.info(`Completed batch job ${job.id} for user ${job.userId}`);
            }
            // Remove completed or failed jobs after 1 hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            this.queue = this.queue.filter(j => (j.status !== 'completed' && j.status !== 'failed') ||
                j.updatedAt > oneHourAgo);
            // Small delay between processing jobs
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    /**
     * Process a single prompt
     */
    async processPrompt(userId, prompt) {
        try {
            const result = await workflowService_1.workflowService.generateWorkflow({
                prompt,
                userId,
                useCache: true
            });
            return {
                workflow: result.workflow,
                status: result.status,
                workflowId: result.workflowId
            };
        }
        catch (error) {
            logger_1.logger.error('Error processing prompt in batch', { error, userId, prompt });
            throw error;
        }
    }
    /**
     * Helper to chunk array into smaller arrays
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
exports.batchService = BatchService.getInstance();
