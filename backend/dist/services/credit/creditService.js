"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditService = void 0;
// src/services/credit/creditService.ts
const supabaseService_1 = require("../database/supabaseService");
const logger_1 = require("../../utils/logger");
class CreditService {
    constructor() {
        logger_1.logger.info('Credit service initialized');
    }
    static getInstance() {
        if (!CreditService.instance) {
            CreditService.instance = new CreditService();
        }
        return CreditService.instance;
    }
    /**
     * Get user credit information
     */
    async getUserCredits(userId) {
        try {
            const userData = await supabaseService_1.supabaseService.getUserById(userId);
            if (!userData) {
                throw new Error('User not found');
            }
            return {
                credits: userData.credits || 0,
                plan: userData.plan || 'free',
                trialStart: userData.trial_start,
                subscriptionId: userData.subscription_id
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting user credits', { error, userId });
            throw error;
        }
    }
    /**
     * Check if user has sufficient credits
     */
    async hasSufficientCredits(userId, required = 1) {
        try {
            const { credits, plan, trialStart } = await this.getUserCredits(userId);
            // Free trial users don't need credits during trial period
            if (plan === 'free' && trialStart) {
                const trialExpired = this.hasTrialExpired(trialStart);
                if (!trialExpired)
                    return true;
            }
            return credits >= required;
        }
        catch (error) {
            logger_1.logger.error('Error checking sufficient credits', { error, userId });
            throw error;
        }
    }
    /**
     * Process a credit transaction
     */
    async processTransaction(transaction) {
        try {
            // Get current user credits
            const { credits } = await this.getUserCredits(transaction.userId);
            // Calculate new credit balance
            const newCredits = credits + transaction.amount;
            // Update user credits
            await supabaseService_1.supabaseService.updateUserCredits(transaction.userId, newCredits);
            // Record transaction in history
            await supabaseService_1.supabaseService.recordCreditUsage({
                user_id: transaction.userId,
                action: transaction.action,
                amount: transaction.amount,
                workflow_id: transaction.workflowId,
                metadata: transaction.metadata
            });
            // Return updated credit info
            return await this.getUserCredits(transaction.userId);
        }
        catch (error) {
            logger_1.logger.error('Error processing credit transaction', { error, transaction });
            throw error;
        }
    }
    /**
     * Deduct credits for workflow generation
     */
    async deductCreditsForWorkflow(userId, workflowId, amount = 1) {
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
    async addCreditsFromPurchase(userId, amount, metadata) {
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
    hasTrialExpired(trialStart) {
        const trialDate = new Date(trialStart);
        const now = new Date();
        const daysSinceTrial = Math.floor((now.getTime() - trialDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceTrial > 7; // 7-day trial
    }
    /**
     * Get credit transaction history
     */
    async getCreditHistory(userId) {
        try {
            return await supabaseService_1.supabaseService.getCreditHistoryByUserId(userId);
        }
        catch (error) {
            logger_1.logger.error('Error getting credit history', { error, userId });
            throw error;
        }
    }
}
exports.creditService = CreditService.getInstance();
