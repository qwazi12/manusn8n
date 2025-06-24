// src/services/cache/cacheService.ts
import { createClient } from 'redis';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

// Interface for cache operations
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

class CacheService {
  private client: any;
  private connected: boolean = false;
  private static instance: CacheService;
  private localCache: Map<string, { value: any; expires: number }> = new Map();

  private constructor() {
    this.initializeRedisClient();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async initializeRedisClient() {
    try {
      // Check if Redis URL is configured and not a placeholder
      if (!config.redis.url || config.redis.url === 'redis://localhost:6379') {
        logger.info('Redis not configured or using default localhost. Using local cache only.');
        this.connected = false;
        return;
      }

      // PLACEHOLDER: Replace with your actual Redis connection
      // INTEGRATION: Set up Redis locally or use a cloud provider
      this.client = createClient({
        url: config.redis.url
      });

      this.client.on('error', (err: any) => {
        logger.warn('Redis client error, falling back to local cache', { error: err.message });
        this.connected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.connected = true;
      });

      // Set a timeout for Redis connection
      const connectionTimeout = setTimeout(() => {
        logger.warn('Redis connection timeout, falling back to local cache');
        this.connected = false;
      }, 5000);

      await this.client.connect();
      clearTimeout(connectionTimeout);
    } catch (error) {
      logger.warn('Failed to initialize Redis client, falling back to local cache', { error: error instanceof Error ? error.message : error });
      this.connected = false;
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || 3600; // Default TTL: 1 hour
      
      if (this.connected) {
        await this.client.set(key, JSON.stringify(value), { EX: ttl });
        logger.debug('Value set in Redis cache', { key });
      } else {
        // Fallback to local cache
        this.localCache.set(key, {
          value,
          expires: Date.now() + ttl * 1000
        });
        logger.debug('Value set in local cache', { key });
      }
    } catch (error) {
      logger.error('Error setting cache value', { error, key });
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
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.connected) {
        const value = await this.client.get(key);
        if (!value) return null;
        return JSON.parse(value) as T;
      } else {
        // Fallback to local cache
        const cached = this.localCache.get(key);
        if (!cached) return null;
        
        // Check if expired
        if (cached.expires < Date.now()) {
          this.localCache.delete(key);
          return null;
        }
        
        return cached.value as T;
      }
    } catch (error) {
      logger.error('Error getting cache value', { error, key });
      
      // Try local cache as fallback
      const cached = this.localCache.get(key);
      if (!cached) return null;
      
      // Check if expired
      if (cached.expires < Date.now()) {
        this.localCache.delete(key);
        return null;
      }
      
      return cached.value as T;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.connected) {
        await this.client.del(key);
      }
      // Always remove from local cache
      this.localCache.delete(key);
    } catch (error) {
      logger.error('Error deleting cache value', { error, key });
      // Ensure it's removed from local cache
      this.localCache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.connected) {
        await this.client.flushAll();
      }
      // Always clear local cache
      this.localCache.clear();
    } catch (error) {
      logger.error('Error clearing cache', { error });
      // Ensure local cache is cleared
      this.localCache.clear();
    }
  }

  /**
   * Generate a cache key for workflow generation
   */
  generateWorkflowCacheKey(prompt: string, userId: string): string {
    // Create a deterministic key based on prompt and user
    return `workflow:${userId}:${Buffer.from(prompt).toString('base64')}`;
  }
}

export const cacheService = CacheService.getInstance();
