// src/services/batch/batchService.ts
import { workflowService } from '../workflow/workflowService';
import { logger } from '../../utils/logger';

// Types for batch processing
export interface BatchJob {
  id: string;
  userId: string;
  prompts: string[];
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: any[];
  createdAt: Date;
  updatedAt: Date;
}

class BatchService {
  private queue: BatchJob[] = [];
  private isProcessing: boolean = false;
  private batchSize: number = 5;
  private static instance: BatchService;

  private constructor() {
    logger.info('Batch service initialized');
    this.startProcessing();
  }

  public static getInstance(): BatchService {
    if (!BatchService.instance) {
      BatchService.instance = new BatchService();
    }
    return BatchService.instance;
  }

  /**
   * Add a batch job to the queue
   */
  public addToBatch(userId: string, prompts: string[], priority: number = 1): string {
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
    
    logger.info(`Added batch job for user ${userId} with ${prompts.length} prompts`, { jobId });
    
    return jobId;
  }

  /**
   * Get batch job status
   */
  public getBatchJob(jobId: string): BatchJob | null {
    const job = this.queue.find(job => job.id === jobId);
    return job || null;
  }

  /**
   * Get all batch jobs for a user
   */
  public getUserBatchJobs(userId: string): BatchJob[] {
    return this.queue.filter(job => job.userId === userId);
  }

  /**
   * Start processing the batch queue
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
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
        
        logger.info(`Processing batch job ${job.id} for user ${job.userId}`);
        
        // Process prompts in parallel with limited concurrency
        const results = [];
        const chunks = this.chunkArray(job.prompts, this.batchSize);
        
        for (const chunk of chunks) {
          const chunkPromises = chunk.map(prompt => 
            this.processPrompt(job.userId, prompt)
              .catch(error => {
                logger.error(`Error processing prompt in batch job ${job.id}`, { error, prompt });
                return { error: error.message };
              })
          );
          
          const chunkResults = await Promise.all(chunkPromises);
          results.push(...chunkResults);
        }
        
        // Update job with results
        job.results = results;
        job.status = 'completed';
        job.updatedAt = new Date();
        
        logger.info(`Completed batch job ${job.id} for user ${job.userId}`);
      }
      
      // Remove completed or failed jobs after 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      this.queue = this.queue.filter(j => 
        (j.status !== 'completed' && j.status !== 'failed') || 
        j.updatedAt > oneHourAgo
      );
      
      // Small delay between processing jobs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Process a single prompt
   */
  private async processPrompt(userId: string, prompt: string): Promise<any> {
    try {
      const result = await workflowService.generateWorkflow({
        prompt,
        userId,
        useCache: true
      });
      
      return {
        workflow: result.workflow,
        status: result.status,
        workflowId: result.workflowId
      };
    } catch (error) {
      logger.error('Error processing prompt in batch', { error, userId, prompt });
      throw error;
    }
  }

  /**
   * Helper to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export const batchService = BatchService.getInstance();
