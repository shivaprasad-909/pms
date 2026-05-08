// ============================================
// Role-Based Access Control (RBAC) Middleware
// ============================================
// Restricts route access based on user roles.
// Must be used AFTER the authenticate middleware.
// ============================================

import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';

/**
 * Middleware Factory: Authorize by Role
 * 
 * Creates a middleware that checks if the authenticated
 * user has one of the allowed roles.
 * 
 * @param allowedRoles - Array of roles that can access this route
 * @returns Express middleware function
 * 
 * Usage:
 *   router.delete('/project', authenticate, authorize('FOUNDER', 'ADMIN'), handler)
 * 
 * Role Hierarchy (highest to lowest):
 *   FOUNDER > ADMIN > MANAGER > DEVELOPER
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Step 1: Make sure the user is authenticated first
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Step 2: Check if the user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
      });
      return;
    }

    // Step 3: User has the required role, proceed
    next();
  };
};

/**
 * Middleware: Founder Only
 * 
 * Shorthand for routes that only the Founder can access.
 * 
 * Usage:
 *   router.post('/approve', authenticate, founderOnly, handler)
 */
export const founderOnly = authorize('FOUNDER' as Role);

/**
 * Middleware: Admin or Above
 * 
 * Shorthand for routes accessible by Founder and Admin.
 * 
 * Usage:
 *   router.post('/users', authenticate, adminOrAbove, handler)
 */
export const adminOrAbove = authorize('FOUNDER' as Role, 'ADMIN' as Role);

/**
 * Middleware: Manager or Above
 * 
 * Shorthand for routes accessible by Founder, Admin, and Manager.
 */
export const managerOrAbove = authorize(
  'FOUNDER' as Role, 
  'ADMIN' as Role, 
  'MANAGER' as Role
);
