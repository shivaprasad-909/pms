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
export declare const authorize: (...allowedRoles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware: Founder Only
 *
 * Shorthand for routes that only the Founder can access.
 *
 * Usage:
 *   router.post('/approve', authenticate, founderOnly, handler)
 */
export declare const founderOnly: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware: Admin or Above
 *
 * Shorthand for routes accessible by Founder and Admin.
 *
 * Usage:
 *   router.post('/users', authenticate, adminOrAbove, handler)
 */
export declare const adminOrAbove: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware: Manager or Above
 *
 * Shorthand for routes accessible by Founder, Admin, and Manager.
 */
export declare const managerOrAbove: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware: Require Specific Granular Permission
 * Checks if the user's JWT payload includes the requested permission string.
 * Users with '*' permission bypass this check.
 */
export declare const requirePermission: (requiredPermission: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map