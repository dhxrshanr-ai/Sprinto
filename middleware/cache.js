const { getClient } = require('../config/redis');
const logger = require('../config/logger');

/**
 * Middleware to cache GET requests based on a prefix and req.originalUrl
 */
const cacheData = (prefix, expireInSeconds = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const redisClient = getClient();
        if (!redisClient || !redisClient.isReady) {
            return next();
        }

        // Cache key incorporates userId if present
        const cacheKey = req.user
            ? `${prefix}:${req.user._id}:${req.originalUrl}`
            : `${prefix}:public:${req.originalUrl}`;

        try {
            const cachedValue = await redisClient.get(cacheKey);
            if (cachedValue) {
                logger.debug(`Cache hit for ${cacheKey}`);
                return res.json(JSON.parse(cachedValue));
            }

            logger.debug(`Cache miss for ${cacheKey}`);
            
            // Override res.json to cache response
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redisClient.setEx(cacheKey, expireInSeconds, JSON.stringify(body))
                        .catch(err => logger.error(`Error caching ${cacheKey}`, err));
                }
                return originalJson(body);
            };

            next();
        } catch (error) {
            logger.error(`Redis cache error on ${cacheKey}:`, error);
            next();
        }
    };
};

module.exports = cacheData;
