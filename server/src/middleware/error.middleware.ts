import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Global error handler middleware.
 * Catches AppError instances and returns structured JSON responses.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof AppError && 'errors' in err ? { errors: (err as any).errors } : {}),
    });
    return;
  }

  // Prisma known request errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
  }

  console.error('❌ Unhandled Error:', err);
  
  let errorMessage = 'Internal server error';
  if (process.env.NODE_ENV === 'development') {
    if (err.message.includes('prisma') || err.message.includes('invocation')) {
      errorMessage = 'Database connection error or schema mismatch. Please run `npx prisma db push`.';
    } else {
      errorMessage = err.message;
    }
  }

  res.status(500).json({
    success: false,
    message: errorMessage,
  });
};
