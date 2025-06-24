// src/lib/api/batchApi.ts
import { apiClient } from './apiClient';

// Types for batch API
export interface CreateBatchJobRequest {
  prompts: string[];
  priority?: number;
}

export interface BatchJobResponse {
  jobId: string;
  message: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  promptCount: number;
}

export interface BatchJobStatusResponse extends BatchJobResponse {
  completedCount: number;
  results: any[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchJobListItem {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  promptCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

// Batch API methods
export const batchApi = {
  // Create a new batch job
  async createBatchJob(request: CreateBatchJobRequest): Promise<BatchJobResponse> {
    return apiClient.post<BatchJobResponse>('/batch/create', request);
  },

  // Get batch job status
  async getBatchJobStatus(jobId: string): Promise<BatchJobStatusResponse> {
    return apiClient.get<BatchJobStatusResponse>(`/batch/status/${jobId}`);
  },

  // Get all batch jobs for the current user
  async getUserBatchJobs(): Promise<BatchJobListItem[]> {
    const response = await apiClient.get<{ jobs: BatchJobListItem[] }>('/batch/user');
    return response.jobs;
  }
};
