// src/services/credit/creditService.ts
import { supabaseService } from '../database/supabaseService';
import { logger } from '../../utils/logger';

// Types for credit operations
export interface CreditTransaction {
  userId: string;
  amount: number;
  action: 'generation' | 'purchase' | 'refund' | 'subscription' | 'trial';
  workflowId?: string;
  metadata?: Record<string, any>;
}

export interface UserCreditInfo {
  credits: number;
  plan: 'free' | 'pro' | 'enterprise';
  trialStart?: string;
  subscriptionId?: string;
}

class CreditService {
  private static instance: CreditService;

  private constructor() {
    logger.info('Credit service initialized');
  }

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  /**
   * Get user credit information
   */
  async getUserCredits(userId: string): Promise<UserCreditInfo> {
    try {
      const userData = await supabaseService.getUserById(userId);
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      return {
        credits: userData.credits || 0,
        plan: userData.plan || 'free',
        trialStart: userData.trial_start,
        subscriptionId: userData.subscription_id
      };
    } catch (error) {
      logger.error('Error getting user credits', { error, userId });
      throw error;
    }
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, required: number = 1): Promise<boolean> {
    try {
      const { credits, plan, trialStart } = await this.getUserCredits(userId);
      
      // Free trial users don't need credits during trial period
      if (plan === 'free' && trialStart) {
        const trialExpired = this.hasTrialExpired(trialStart);
        if (!trialExpired) return true;
      }
      
      return credits >= required;
    } catch (error) {
      logger.error('Error checking sufficient credits', { error, userId });
      throw error;
    }
  }

  /**
   * Process a credit transaction
   */
  async processTransaction(transaction: CreditTransaction): Promise<UserCreditInfo> {
    try {
      // Get current user credits
      const { credits } = await this.getUserCredits(transaction.userId);
      
      // Calculate new credit balance
      const newCredits = credits + transaction.amount;
      
      // Update user credits
      await supabaseService.updateUserCredits(transaction.userId, newCredits);
      
      // Record transaction in history
      await supabaseService.recordCreditUsage({
        user_id: transaction.userId,
        action: transaction.action,
        amount: transaction.amount,
        workflow_id: transaction.workflowId,
        metadata: transaction.metadata
      });
      
      // Return updated credit info
      return await this.getUserCredits(transaction.userId);
    } catch (error) {
      logger.error('Error processing credit transaction', { error, transaction });
      throw error;
    }
  }

  /**
   * Deduct credits for workflow generation
   */
  async deductCreditsForWorkflow(userId: string, workflowId: string, amount: number = 1): Promise<UserCreditInfo> {
    return this.processTransaction({
      userId,
      amount: -amount, // Negative amount for deduction
      action: 'generation',
      workflowId
    });
  }

  /**
   * Add credits from purchase
   */
  async addCreditsFromPurchase(userId: string, amount: number, metadata?: Record<string, any>): Promise<UserCreditInfo> {
    return this.processTransaction({
      userId,
      amount,
      action: 'purchase',
      metadata
    });
  }

  /**
   * Check if trial has expired
   */
  hasTrialExpired(trialStart: string): boolean {
    const trialDate = new Date(trialStart);
    const now = new Date();
    const daysSinceTrial = Math.floor((now.getTime() - trialDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceTrial > 7; // 7-day trial
  }

  /**
   * Get credit transaction history
   */
  async getCreditHistory(userId: string): Promise<any[]> {
    try {
      return await supabaseService.getCreditHistoryByUserId(userId);
    } catch (error) {
      logger.error('Error getting credit history', { error, userId });
      throw error;
    }
  }
}

export const creditService = CreditService.getInstance();
