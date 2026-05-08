import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
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
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map