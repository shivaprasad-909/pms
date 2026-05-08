// ============================================
// Environment Configuration
// ============================================
// Loads and validates environment variables.
// This file centralizes all config so the rest
// of the app accesses env vars from here.
// ============================================

import dotenv from 'dotenv';

// Load .env file into process.env
dotenv.config();

/**
 * Application configuration object.
 * All environment variables are accessed through this object
 * to prevent typos and provide defaults.
 */
const config = {
  // Server settings
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT Authentication
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  // Frontend URL (for CORS)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

export default config;
