// src/lib/api/creditApi.ts
import { apiClient } from './apiClient';

// Types for credit API
export interface CreditInfo {
  credits: number;
  plan: 'free' | 'pro' | 'enterprise';
  trialStart?: string;
  subscriptionId?: string;
}

export interface CreditHistoryItem {
  id: string;
  user_id: string;
  action: 'generation' | 'purchase' | 'refund' | 'subscription' | 'trial';
  amount: number;
  workflow_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PurchaseCreditsRequest {
  amount: number;
  paymentMethod: string;
  paymentDetails: any;
}

export interface PurchaseCreditsResponse {
  success: boolean;
  message: string;
  credits: number;
}

// Credit API methods
export const creditApi = {
  // Get user credit information
  async getUserCredits(): Promise<CreditInfo> {
    return apiClient.get<CreditInfo>('/credits');
  },

  // Get credit transaction history
  async getCreditHistory(): Promise<CreditHistoryItem[]> {
    const response = await apiClient.get<{ history: CreditHistoryItem[] }>('/credits/history');
    return response.history;
  },

  // Purchase credits
  async purchaseCredits(request: PurchaseCreditsRequest): Promise<PurchaseCreditsResponse> {
    return apiClient.post<PurchaseCreditsResponse>('/credits/purchase', request);
  }
};
