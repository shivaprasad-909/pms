import { Request, Response, NextFunction } from 'express';
/**
 * Wraps async route handlers to automatically catch errors
 * and forward them to Express error middleware.
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=asyncHandler.d.ts.map