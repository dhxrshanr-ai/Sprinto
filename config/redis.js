const { createClient } = require('redis');
const logger = require('./logger');

let redisClient;

const connectRedis = async () => {
    if (!process.env.REDIS_URI) {
        logger.warn('REDIS_URI not provided, caching will be disabled');
        return null;
    }
    
    redisClient = createClient({ url: process.env.REDIS_URI });
    
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis connected successfully'));
    
    try {
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.error('Failed to connect to Redis', error);
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
