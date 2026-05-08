"use strict";
// ============================================
// Utility Helper Functions
// ============================================
// Reusable utility functions used throughout 
// the backend application.
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = exports.createResponse = exports.generateUniqueSlug = exports.createSlug = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
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
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * Compare a plain text password with a hashed password.
 *
 * @param password - The plain text password to check
 * @param hashedPassword - The stored hashed password
 * @returns True if the passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
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
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.accessSecret, {
        expiresIn: config_1.default.jwt.accessExpiresIn,
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate a JWT refresh token.
 * Refresh tokens are long-lived (7 days by default).
 * They are used to get new access tokens without re-logging in.
 *
 * @param payload - The data to encode in the token
 * @returns The signed JWT refresh token string
 */
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.refreshSecret, {
        expiresIn: config_1.default.jwt.refreshExpiresIn,
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify and decode a JWT access token.
 *
 * @param token - The JWT token string to verify
 * @returns The decoded payload if valid
 * @throws Error if the token is invalid or expired
 */
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.jwt.accessSecret);
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify and decode a JWT refresh token.
 *
 * @param token - The JWT token string to verify
 * @returns The decoded payload if valid
 * @throws Error if the token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.jwt.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
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
const createSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.createSlug = createSlug;
/**
 * Generate a unique slug by appending a random suffix.
 * Used when the base slug already exists in the database.
 *
 * @param baseSlug - The base slug to make unique
 * @returns A unique slug with random suffix
 */
const generateUniqueSlug = (baseSlug) => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
};
exports.generateUniqueSlug = generateUniqueSlug;
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
const createResponse = (success, message, data) => {
    return {
        success,
        message,
        data,
    };
};
exports.createResponse = createResponse;
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
const getPagination = (page, limit) => {
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
exports.getPagination = getPagination;
//# sourceMappingURL=helpers.js.map