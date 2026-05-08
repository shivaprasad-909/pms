"use strict";
// ============================================
// Authentication Middleware
// ============================================
// Verifies JWT tokens on protected routes.
// This middleware runs BEFORE route handlers
// and attaches the user info to the request.
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const helpers_1 = require("../utils/helpers");
/**
 * Middleware: Authenticate User
 *
 * Checks for a valid JWT access token in the
 * Authorization header. If valid, attaches the
 * decoded user info to req.user.
 *
 * Usage in routes:
 *   router.get('/protected', authenticate, handler)
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
    try {
        // Step 1: Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided — user is not authenticated
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        // Step 2: Extract the token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];
        // Step 3: Verify the token and decode the payload
        const decoded = (0, helpers_1.verifyAccessToken)(token);
        // Step 4: Attach user info to the request object
        // Now all subsequent handlers can access req.user
        req.user = decoded;
        // Step 5: Continue to the next middleware/handler
        next();
    }
    catch (error) {
        // Token is invalid or expired
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.',
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map