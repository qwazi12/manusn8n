// src/services/credit/creditService.ts
import { supabaseService } from '../database/supabaseService';
import { logger } from '../../utils/logger';

// NodePilot Pricing Plans
export interface PricingPlan {
  id: 'free' | 'pro' | 'payg';
  name: string;
  price: number;
  credits: number;
  features: string[];
  duration?: 'trial' | 'monthly' | 'per_purchase';
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    credits: 75, // 50-100 credits (introductory)
    features: [
      '7-day trial, then upgrade required',
      'Natural language → n8n JSON workflow generation',
      'Step-by-step guide with each workflow',
      'Basic support'
    ],
    duration: 'trial'
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 17.99,
    credits: 500,
    features: [
      'All Free features',
      'Priority AI processing',
      'Upload files/images for smarter prompts',
      'Retain workflows',
      'Multi-turn refinement chat'
    ],
    duration: 'monthly'
  },
  payg: {
    id: 'payg',
    name: 'Pay-As-You-Go',
    price: 5,
    credits: 100,
    features: [
      'No subscription required',
      'All standard generation features',
      'Credits expire after 30 days'
    ],
    duration: 'per_purchase'
  }
};

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
  plan: 'free' | 'pro' | 'payg';
  trialStart?: string;
  subscriptionId?: string;
  planExpiry?: string;
  isTrialActive?: boolean;
  isSubscriptionActive?: boolean;
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
      
      const trialStart = userData.trial_start;
      const isTrialActive = trialStart ? !this.hasTrialExpired(trialStart) : false;
      const planExpiry = userData.plan_expiry;
      const isSubscriptionActive = planExpiry ? new Date(planExpiry) > new Date() : false;
      
      return {
        credits: userData.credits || 0,
        plan: userData.plan || 'free',
        trialStart,
        subscriptionId: userData.subscription_id,
        planExpiry,
        isTrialActive,
        isSubscriptionActive
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
      const { credits, plan, isTrialActive, isSubscriptionActive } = await this.getUserCredits(userId);
      
      // Free trial users can use credits during trial period
      if (plan === 'free' && isTrialActive) {
        return credits >= required;
      }
      
      // Pro plan users with active subscription
      if (plan === 'pro' && isSubscriptionActive) {
        return credits >= required;
      }
      
      // Pay-as-you-go users (credits don't expire for 30 days)
      if (plan === 'payg') {
        return credits >= required;
      }
      
      // Free trial expired - no credits allowed
      if (plan === 'free' && !isTrialActive) {
        return false;
      }
      
      // Default: check if user has enough credits
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
        transaction_type: transaction.action === 'generation' ? 'usage' : transaction.action,
        credits_amount: Math.abs(transaction.amount),
        credits_before: credits,
        credits_after: newCredits,
        description: `${transaction.action} transaction`,
        workflow_id: transaction.workflowId
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

  /**
   * Initialize new user with free trial
   */
  async initializeNewUser(userId: string): Promise<UserCreditInfo> {
    try {
      const freePlan = PRICING_PLANS.free;
      const trialStart = new Date().toISOString();
      
      // Set user to free plan with trial credits
      await supabaseService.updateUserPlan(userId, {
        plan: 'free',
        credits: freePlan.credits,
        trial_start: trialStart,
        plan_expiry: null,
        subscription_id: null
      });
      
      // Record trial initialization
      await this.processTransaction({
        userId,
        amount: freePlan.credits,
        action: 'trial',
        metadata: { plan: 'free', trial_start: trialStart }
      });
      
      return await this.getUserCredits(userId);
    } catch (error) {
      logger.error('Error initializing new user', { error, userId });
      throw error;
    }
  }

  /**
   * Upgrade user to Pro plan
   */
  async upgradeToProPlan(userId: string, subscriptionId: string): Promise<UserCreditInfo> {
    try {
      const proPlan = PRICING_PLANS.pro;
      const planExpiry = new Date();
      planExpiry.setMonth(planExpiry.getMonth() + 1); // 1 month from now
      
      await supabaseService.updateUserPlan(userId, {
        plan: 'pro',
        credits: proPlan.credits,
        subscription_id: subscriptionId,
        plan_expiry: planExpiry.toISOString(),
        trial_start: null
      });
      
      // Record subscription
      await this.processTransaction({
        userId,
        amount: proPlan.credits,
        action: 'subscription',
        metadata: { plan: 'pro', subscription_id: subscriptionId }
      });
      
      return await this.getUserCredits(userId);
    } catch (error) {
      logger.error('Error upgrading to pro plan', { error, userId });
      throw error;
    }
  }

  /**
   * Purchase PAYG credits
   */
  async purchasePaygCredits(userId: string, purchaseId: string): Promise<UserCreditInfo> {
    try {
      const paygPlan = PRICING_PLANS.payg;
      
      // Add credits to existing balance
      const currentCredits = await this.getUserCredits(userId);
      const newCredits = currentCredits.credits + paygPlan.credits;
      
      await supabaseService.updateUserCredits(userId, newCredits);
      
      // Record purchase
      await this.processTransaction({
        userId,
        amount: paygPlan.credits,
        action: 'purchase',
        metadata: { plan: 'payg', purchase_id: purchaseId, expires_in_days: 30 }
      });
      
      return await this.getUserCredits(userId);
    } catch (error) {
      logger.error('Error purchasing PAYG credits', { error, userId });
      throw error;
    }
  }

  /**
   * Get available pricing plans
   */
  getPricingPlans(): Record<string, PricingPlan> {
    return PRICING_PLANS;
  }

  /**
   * Check if user needs to upgrade (trial expired)
   */
  async needsUpgrade(userId: string): Promise<boolean> {
    try {
      const { plan, isTrialActive, isSubscriptionActive } = await this.getUserCredits(userId);
      
      if (plan === 'free' && !isTrialActive) return true;
      if (plan === 'pro' && !isSubscriptionActive) return true;
      
      return false;
    } catch (error) {
      logger.error('Error checking upgrade status', { error, userId });
      return true; // Default to requiring upgrade on error
    }
  }
}

export const creditService = CreditService.getInstance();
