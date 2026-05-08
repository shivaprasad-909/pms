import { JwtPayload } from '../types';
/**
 * Hash a plain text password using bcrypt.
 *
 * @param password - The plain text password to hash
 * @returns The hashed password string
 *
 * The salt rounds (12) determine how complex the hash is.
 * Higher = more secure but slower. 12 is a good balance.
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compare a plain text password with a hashed password.
 *
 * @param password - The plain text password to check
 * @param hashedPassword - The stored hashed password
 * @returns True if the passwords match, false otherwise
 */
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
/**
 * Generate a JWT access token.
 * Access tokens are short-lived (15 minutes by default).
 * They are used to authenticate API requests.
 *
 * @param payload - The data to encode in the token
 * @returns The signed JWT access token string
 */
export declare const generateAccessToken: (payload: JwtPayload) => string;
/**
 * Generate a JWT refresh token.
 * Refresh tokens are long-lived (7 days by default).
 * They are used to get new access tokens without re-logging in.
 *
 * @param payload - The data to encode in the token
 * @returns The signed JWT refresh token string
 */
export declare const generateRefreshToken: (payload: JwtPayload) => string;
/**
 * Verify and decode a JWT access token.
 *
 * @param token - The JWT token string to verify
 * @returns The decoded payload if valid
 * @throws Error if the token is invalid or expired
 */
export declare const verifyAccessToken: (token: string) => JwtPayload;
/**
 * Verify and decode a JWT refresh token.
 *
 * @param token - The JWT token string to verify
 * @returns The decoded payload if valid
 * @throws Error if the token is invalid or expired
 */
export declare const verifyRefreshToken: (token: string) => JwtPayload;
/**
 * Create a URL-friendly slug from a string.
 * Example: "My Project Name" → "my-project-name"
 *
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug string
 */
export declare const createSlug: (text: string) => string;
/**
 * Generate a unique slug by appending a random suffix.
 * Used when the base slug already exists in the database.
 *
 * @param baseSlug - The base slug to make unique
 * @returns A unique slug with random suffix
 */
export declare const generateUniqueSlug: (baseSlug: string) => string;
/**
 * Create a standardized API response object.
 * All API endpoints should use this to ensure consistent response format.
 *
 * @param success - Whether the request was successful
 * @param message - Human-readable message
 * @param data - Optional response data
 * @returns Formatted API response object
 */
export declare const createResponse: <T>(success: boolean, message: string, data?: T) => {
    success: boolean;
    message: string;
    data: T;
};
/**
 * Calculate pagination parameters from query params.
 * Provides sensible defaults and limits.
 *
 * @param page - Requested page number
 * @param limit - Requested items per page
 * @returns Calculated skip and take values for Prisma
 */
export declare const getPagination: (page?: number, limit?: number) => {
    page: number;
    limit: number;
    skip: number;
    take: number;
};
//# sourceMappingURL=helpers.d.ts.map