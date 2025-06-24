// src/lib/api/workflowApi.ts
import { apiClient } from './apiClient';

// Types for workflow API
export interface WorkflowRequest {
  prompt: string;
  files?: string[];
  useCache?: boolean;
}

export interface WorkflowResponse {
  workflow: any;
  workflowId?: string;
  message: string;
  remaining_credits: number;
}

export interface WorkflowListItem {
  id: string;
  prompt: string;
  status: string;
  created_at: string;
  credits_used: number;
}

// Workflow API methods
export const workflowApi = {
  // Generate a workflow
  async generateWorkflow(request: WorkflowRequest): Promise<WorkflowResponse> {
    return apiClient.post<WorkflowResponse>('/workflows/generate', request);
  },

  // Get all workflows for the current user
  async getUserWorkflows(): Promise<WorkflowListItem[]> {
    const response = await apiClient.get<{ workflows: WorkflowListItem[] }>('/workflows');
    return response.workflows;
  },

  // Get a specific workflow by ID
  async getWorkflowById(id: string): Promise<any> {
    return apiClient.get<any>(`/workflows/${id}`);
  }
};
