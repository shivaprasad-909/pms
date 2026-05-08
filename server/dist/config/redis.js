"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const index_1 = __importDefault(require("./index"));
let redisClient = null;
try {
    // Gracefully fallback if Redis URL is not configured
    if (process.env.REDIS_URL || index_1.default.redis.host) {
        const defaultUrl = index_1.default.redis.password
            ? `redis://:${index_1.default.redis.password}@${index_1.default.redis.host}:${index_1.default.redis.port}`
            : `redis://${index_1.default.redis.host}:${index_1.default.redis.port}`;
        redisClient = new ioredis_1.default(process.env.REDIS_URL || defaultUrl, {
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
    }
    else {
        console.warn('⚠️ No REDIS_URL provided. Background queues will be disabled.');
    }
}
catch (error) {
    console.warn('Redis initialization skipped.');
}
exports.default = redisClient;
//# sourceMappingURL=redis.js.map