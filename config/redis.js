const { createClient } = require('redis');
const logger = require('./logger');

let redisClient;

const connectRedis = async () => {
    if (!process.env.REDIS_URI) {
        logger.warn('REDIS_URI not provided, caching will be disabled');
        return null;
    }
    
    // Only connect once in serverless
    if (redisClient) return redisClient;
    
    redisClient = createClient({ 
        url: process.env.REDIS_URI,
        socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => (retries > 3 ? new Error('Max retries exceeded') : 1000)
        }
    });
    
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis connected successfully'));
    
    try {
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        // Log as warning rather than error if redis is optional
        logger.warn('Redis is not available. Caching will be disabled.');
        redisClient = null; 
        return null;
    }
};

const getClient = () => redisClient;

const clearCachePrefix = async (prefix) => {
    if (!redisClient || !redisClient.isReady) return;
    try {
        const keys = await redisClient.keys(`${prefix}:*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) {
        logger.error(`Error clearing cache for prefix ${prefix}`, err);
    }
};

module.exports = { connectRedis, getClient, clearCachePrefix };
