import { Request, Response, NextFunction } from 'express';
/**
 * Middleware: Handle Validation Errors
 *
 * Checks if any validation rules failed and returns
 * a 400 error with details about what went wrong.
 * Must be placed AFTER validation rules in the middleware chain.
 *
 * Usage:
 *   router.post('/users', loginValidation, handleValidationErrors, handler)
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation rules for user registration.
 * Checks that all required fields are present and valid.
 */
export declare const registerValidation: import("express-validator").ValidationChain[];
/**
 * Validation rules for user login.
 */
export declare const loginValidation: import("express-validator").ValidationChain[];
/**
 * Validation rules for creating a project.
 */
export declare const createProjectValidation: import("express-validator").ValidationChain[];
/**
 * Validation rules for updating a project.
 */
export declare const updateProjectValidation: import("express-validator").ValidationChain[];
/**
 * Validation rules for creating a task.
 */
export declare const createTaskValidation: import("express-validator").ValidationChain[];
/**
 * Validation rules for updating a task.
 */
export declare const updateTaskValidation: import("express-validator").ValidationChain[];
export declare const createSprintValidation: import("express-validator").ValidationChain[];
export declare const createTimeLogValidation: import("express-validator").ValidationChain[];
/**
 * Validate that a URL parameter is a valid UUID.
 * Used for routes like /api/projects/:id
 */
export declare const validateUuidParam: (paramName: string) => import("express-validator").ValidationChain[];
/**
 * Validate common pagination query parameters.
 */
export declare const validatePagination: import("express-validator").ValidationChain[];
//# sourceMappingURL=validate.d.ts.map