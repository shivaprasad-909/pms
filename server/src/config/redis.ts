import Redis from 'ioredis';
import config from './index';

let redisClient: Redis | null = null;

try {
  // Gracefully fallback if Redis URL is not configured
  if (process.env.REDIS_URL || config.redis.host) {
    const defaultUrl = config.redis.password 
      ? `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`
      : `redis://${config.redis.host}:${config.redis.port}`;

    redisClient = new Redis(process.env.REDIS_URL || defaultUrl, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      }
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis Connection Error (Check if Redis is running):', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis successfully');
    });
  } else {
    console.warn('⚠️ No REDIS_URL provided. Background queues will be disabled.');
  }
} catch (error) {
  console.warn('Redis initialization skipped.');
}

export default redisClient;
