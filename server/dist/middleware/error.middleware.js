"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../errors/AppError");
/**
 * Global error handler middleware.
 * Catches AppError instances and returns structured JSON responses.
 */
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err instanceof AppError_1.AppError && 'errors' in err ? { errors: err.errors } : {}),
        });
        return;
    }
    // Prisma known request errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaErr = err;
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
        }
        else {
            errorMessage = err.message;
        }
    }
    res.status(500).json({
        success: false,
        message: errorMessage,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map