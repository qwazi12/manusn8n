"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseService = void 0;
// src/services/database/supabaseService.ts
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../../config/config");
const logger_1 = require("../../utils/logger");
class SupabaseService {
    constructor() {
        // PLACEHOLDER: Replace with your actual Supabase credentials
        // INTEGRATION: Sign up at https://supabase.com and create a new project
        this.client = (0, supabase_js_1.createClient)(config_1.config.supabase.url, config_1.config.supabase.anonKey);
        logger_1.logger.info('Supabase client initialized');
    }
    static getInstance() {
        if (!SupabaseService.instance) {
            SupabaseService.instance = new SupabaseService();
        }
        return SupabaseService.instance;
    }
    getClient() {
        return this.client;
    }
    // User operations
    async getUserById(userId) {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error fetching user by ID', { error, userId });
            throw error;
        }
    }
    async updateUserCredits(userId, credits) {
        try {
            const { data, error } = await this.client
                .from('users')
                .update({ credits })
                .eq('id', userId)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error updating user credits', { error, userId, credits });
            throw error;
        }
    }
    // Workflow operations
    async saveWorkflow(workflowData) {
        try {
            const { data, error } = await this.client
                .from('workflows')
                .insert(workflowData)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error saving workflow', { error, workflowData });
            throw error;
        }
    }
    async getWorkflowsByUserId(userId) {
        try {
            const { data, error } = await this.client
                .from('workflows')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error fetching workflows by user ID', { error, userId });
            throw error;
        }
    }
    // Credit history operations
    async recordCreditUsage(creditData) {
        try {
            const { data, error } = await this.client
                .from('credit_history')
                .insert(creditData)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error recording credit usage', { error, creditData });
            throw error;
        }
    }
    async getCreditHistoryByUserId(userId) {
        try {
            const { data, error } = await this.client
                .from('credit_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error fetching credit history by user ID', { error, userId });
            throw error;
        }
    }
}
exports.supabaseService = SupabaseService.getInstance();
