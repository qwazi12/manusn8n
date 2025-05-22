"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
// src/services/cache/cacheService.ts
const redis_1 = require("redis");
const config_1 = require("../../config/config");
const logger_1 = require("../../utils/logger");
class CacheService {
    constructor() {
        this.connected = false;
        this.localCache = new Map();
        this.initializeRedisClient();
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    async initializeRedisClient() {
        try {
            // PLACEHOLDER: Replace with your actual Redis connection
            // INTEGRATION: Set up Redis locally or use a cloud provider
            this.client = (0, redis_1.createClient)({
                url: config_1.config.redis.url
            });
            this.client.on('error', (err) => {
                logger_1.logger.error('Redis client error', { error: err });
                this.connected = false;
            });
            this.client.on('connect', () => {
                logger_1.logger.info('Redis client connected');
                this.connected = true;
            });
            await this.client.connect();
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Redis client', { error });
            logger_1.logger.info('Falling back to local cache');
            this.connected = false;
        }
    }
    /**
     * Set a value in cache
     */
    async set(key, value, options = {}) {
        try {
            const ttl = options.ttl || 3600; // Default TTL: 1 hour
            if (this.connected) {
                await this.client.set(key, JSON.stringify(value), { EX: ttl });
                logger_1.logger.debug('Value set in Redis cache', { key });
            }
            else {
                // Fallback to local cache
                this.localCache.set(key, {
                    value,
                    expires: Date.now() + ttl * 1000
                });
                logger_1.logger.debug('Value set in local cache', { key });
            }
        }
        catch (error) {
            logger_1.logger.error('Error setting cache value', { error, key });
            // Fallback to local cache on error
            this.localCache.set(key, {
                value,
                expires: Date.now() + (options.ttl || 3600) * 1000
            });
        }
    }
    /**
     * Get a value from cache
     */
    async get(key) {
        try {
            if (this.connected) {
                const value = await this.client.get(key);
                if (!value)
                    return null;
                return JSON.parse(value);
            }
            else {
                // Fallback to local cache
                const cached = this.localCache.get(key);
                if (!cached)
                    return null;
                // Check if expired
                if (cached.expires < Date.now()) {
                    this.localCache.delete(key);
                    return null;
                }
                return cached.value;
            }
        }
        catch (error) {
            logger_1.logger.error('Error getting cache value', { error, key });
            // Try local cache as fallback
            const cached = this.localCache.get(key);
            if (!cached)
                return null;
            // Check if expired
            if (cached.expires < Date.now()) {
                this.localCache.delete(key);
                return null;
            }
            return cached.value;
        }
    }
    /**
     * Delete a value from cache
     */
    async delete(key) {
        try {
            if (this.connected) {
                await this.client.del(key);
            }
            // Always remove from local cache
            this.localCache.delete(key);
        }
        catch (error) {
            logger_1.logger.error('Error deleting cache value', { error, key });
            // Ensure it's removed from local cache
            this.localCache.delete(key);
        }
    }
    /**
     * Clear all cache
     */
    async clear() {
        try {
            if (this.connected) {
                await this.client.flushAll();
            }
            // Always clear local cache
            this.localCache.clear();
        }
        catch (error) {
            logger_1.logger.error('Error clearing cache', { error });
            // Ensure local cache is cleared
            this.localCache.clear();
        }
    }
    /**
     * Generate a cache key for workflow generation
     */
    generateWorkflowCacheKey(prompt, userId) {
        // Create a deterministic key based on prompt and user
        return `workflow:${userId}:${Buffer.from(prompt).toString('base64')}`;
    }
}
exports.cacheService = CacheService.getInstance();
