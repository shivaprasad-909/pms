// ============================================
// Utility Helper Functions
// ============================================
// Reusable utility functions used throughout 
// the backend application.
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload } from '../types';

// ============================================
// Password Utilities
// ============================================

/**
 * Hash a plain text password using bcrypt.
 * 
 * @param password - The plain text password to hash
 * @returns The hashed password string
 * 
 * The salt rounds (12) determine how complex the hash is.
 * Higher = more secure but slower. 12 is a good balance.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password.
 * 
 * @param password - The plain text password to check
 * @param hashedPassword - The stored hashed password
 * @returns True if the passwords match, false otherwise
 */
export const comparePassword = async (
  password: string, 
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// ============================================
// JWT Token Utilities
// ============================================

/**
 * Generate a JWT access token.
 * Access tokens are short-lived (15 minutes by default).
 * They are used to authenticate API requests.
 * 
 * @param payload - The data to encode in the token
 * @returns The signed JWT access token string
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
};

/**
 * Generate a JWT refresh token.
 * Refresh tokens are long-lived (7 days by default).
 * They are used to get new access tokens without re-logging in.
 * 
 * @param payload - The data to encode in the token
 * @returns The signed JWT refresh token string
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
};

/**
 * Verify and decode a JWT access token.
 * 
 * @param token - The JWT token string to verify
 * @returns The decoded payload if valid
 * @throws Error if the token is invalid or expired
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

/**
 * Verify and decode a JWT refresh token.
 * 
 * @param token - The JWT token string to verify
 * @returns The decoded payload if valid
 * @throws Error if the token is invalid or expired
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

// ============================================
// String Utilities
// ============================================

/**
 * Create a URL-friendly slug from a string.
 * Example: "My Project Name" → "my-project-name"
 * 
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove special characters
    .replace(/[\s_-]+/g, '-')   // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug by appending a random suffix.
 * Used when the base slug already exists in the database.
 * 
 * @param baseSlug - The base slug to make unique
 * @returns A unique slug with random suffix
 */
export const generateUniqueSlug = (baseSlug: string): string => {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
};

// ============================================
// Response Helper
// ============================================

/**
 * Create a standardized API response object.
 * All API endpoints should use this to ensure consistent response format.
 * 
 * @param success - Whether the request was successful
 * @param message - Human-readable message
 * @param data - Optional response data
 * @returns Formatted API response object
 */
export const createResponse = <T>(
  success: boolean, 
  message: string, 
  data?: T
) => {
  return {
    success,
    message,
    data,
  };
};

// ============================================
// Pagination Helper
// ============================================

/**
 * Calculate pagination parameters from query params.
 * Provides sensible defaults and limits.
 * 
 * @param page - Requested page number
 * @param limit - Requested items per page
 * @returns Calculated skip and take values for Prisma
 */
export const getPagination = (page?: number, limit?: number) => {
  const currentPage = Math.max(1, page || 1);
  const itemsPerPage = Math.min(100, Math.max(1, limit || 10)); // Between 1 and 100
  const skip = (currentPage - 1) * itemsPerPage;
  
  return {
    page: currentPage,
    limit: itemsPerPage,
    skip,
    take: itemsPerPage,
  };
};
