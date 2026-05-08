import { Request, Response, NextFunction } from 'express';
/**
 * Global error handler middleware.
 * Catches AppError instances and returns structured JSON responses.
 */
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map