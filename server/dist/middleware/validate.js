"use strict";
// ============================================
// Input Validation Middleware
// ============================================
// Uses express-validator to validate and sanitize
// incoming request data before it reaches controllers.
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = exports.validateUuidParam = exports.createTimeLogValidation = exports.createSprintValidation = exports.updateTaskValidation = exports.createTaskValidation = exports.updateProjectValidation = exports.createProjectValidation = exports.loginValidation = exports.registerValidation = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// ============================================
// Validation Error Handler
// ============================================
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
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        // Return all validation errors to the client
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path, // Which field failed
                message: err.msg, // What went wrong
            })),
        });
        return;
    }
    // All validations passed, continue
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// ============================================
// Auth Validations
// ============================================
/**
 * Validation rules for user registration.
 * Checks that all required fields are present and valid.
 */
exports.registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['FOUNDER', 'ADMIN', 'MANAGER', 'DEVELOPER'])
        .withMessage('Invalid role. Must be FOUNDER, ADMIN, MANAGER, or DEVELOPER'),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim(),
    (0, express_validator_1.body)('designation')
        .optional()
        .trim(),
];
/**
 * Validation rules for user login.
 */
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
// ============================================
// Project Validations
// ============================================
/**
 * Validation rules for creating a project.
 */
exports.createProjectValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required')
        .isLength({ max: 100 })
        .withMessage('Project name cannot exceed 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim(),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    (0, express_validator_1.body)('budget')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Budget must be a positive number'),
];
/**
 * Validation rules for updating a project.
 */
exports.updateProjectValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Project name cannot exceed 100 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'])
        .withMessage('Invalid project status'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .withMessage('Invalid priority level'),
];
// ============================================
// Task Validations
// ============================================
/**
 * Validation rules for creating a task.
 */
exports.createTaskValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 200 })
        .withMessage('Task title cannot exceed 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim(),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Estimated hours must be a positive number'),
    (0, express_validator_1.body)('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('projectId')
        .notEmpty()
        .withMessage('Project ID is required')
        .isUUID()
        .withMessage('Invalid project ID format'),
    (0, express_validator_1.body)('assigneeIds')
        .optional()
        .isArray()
        .withMessage('Assignee IDs must be an array'),
    (0, express_validator_1.body)('assigneeIds.*')
        .optional()
        .isUUID()
        .withMessage('Each assignee ID must be a valid UUID'),
];
/**
 * Validation rules for updating a task.
 */
exports.updateTaskValidation = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Task title cannot exceed 200 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])
        .withMessage('Invalid task status'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .withMessage('Invalid priority level'),
];
// ============================================
// Sprint Validations
// ============================================
exports.createSprintValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Sprint name is required'),
    (0, express_validator_1.body)('startDate')
        .notEmpty()
        .isISO8601()
        .withMessage('Start date is required and must be valid'),
    (0, express_validator_1.body)('endDate')
        .notEmpty()
        .isISO8601()
        .withMessage('End date is required and must be valid'),
    (0, express_validator_1.body)('projectId')
        .notEmpty()
        .isUUID()
        .withMessage('Valid project ID is required'),
];
// ============================================
// Time Log Validations
// ============================================
exports.createTimeLogValidation = [
    (0, express_validator_1.body)('hours')
        .isFloat({ min: 0.25, max: 24 })
        .withMessage('Hours must be between 0.25 and 24'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim(),
    (0, express_validator_1.body)('logDate')
        .notEmpty()
        .isISO8601()
        .withMessage('Log date is required and must be valid'),
    (0, express_validator_1.body)('taskId')
        .notEmpty()
        .isUUID()
        .withMessage('Valid task ID is required'),
];
// ============================================
// Common Parameter Validations
// ============================================
/**
 * Validate that a URL parameter is a valid UUID.
 * Used for routes like /api/projects/:id
 */
const validateUuidParam = (paramName) => [
    (0, express_validator_1.param)(paramName)
        .isUUID()
        .withMessage(`${paramName} must be a valid UUID`),
];
exports.validateUuidParam = validateUuidParam;
/**
 * Validate common pagination query parameters.
 */
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];
//# sourceMappingURL=validate.js.map