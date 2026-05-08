// ============================================
// Input Validation Middleware
// ============================================
// Uses express-validator to validate and sanitize
// incoming request data before it reaches controllers.
// ============================================

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

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
export const handleValidationErrors = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Return all validation errors to the client
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: (err as any).path,    // Which field failed
        message: err.msg,             // What went wrong
      })),
    });
    return;
  }
  
  // All validations passed, continue
  next();
};

// ============================================
// Auth Validations
// ============================================

/**
 * Validation rules for user registration.
 * Checks that all required fields are present and valid.
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('role')
    .optional()
    .isIn(['FOUNDER', 'ADMIN', 'MANAGER', 'DEVELOPER'])
    .withMessage('Invalid role. Must be FOUNDER, ADMIN, MANAGER, or DEVELOPER'),
  
  body('phone')
    .optional()
    .trim(),
  
  body('designation')
    .optional()
    .trim(),
];

/**
 * Validation rules for user login.
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ============================================
// Project Validations
// ============================================

/**
 * Validation rules for creating a project.
 */
export const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
];

/**
 * Validation rules for updating a project.
 */
export const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  
  body('status')
    .optional()
    .isIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'])
    .withMessage('Invalid project status'),
  
  body('priority')
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
export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Invalid project ID format'),
  
  body('assigneeIds')
    .optional()
    .isArray()
    .withMessage('Assignee IDs must be an array'),
  
  body('assigneeIds.*')
    .optional()
    .isUUID()
    .withMessage('Each assignee ID must be a valid UUID'),
];

/**
 * Validation rules for updating a task.
 */
export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])
    .withMessage('Invalid task status'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
];

// ============================================
// Sprint Validations
// ============================================

export const createSprintValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Sprint name is required'),
  
  body('startDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Start date is required and must be valid'),
  
  body('endDate')
    .notEmpty()
    .isISO8601()
    .withMessage('End date is required and must be valid'),
  
  body('projectId')
    .notEmpty()
    .isUUID()
    .withMessage('Valid project ID is required'),
];

// ============================================
// Time Log Validations
// ============================================

export const createTimeLogValidation = [
  body('hours')
    .isFloat({ min: 0.25, max: 24 })
    .withMessage('Hours must be between 0.25 and 24'),
  
  body('description')
    .optional()
    .trim(),
  
  body('logDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Log date is required and must be valid'),
  
  body('taskId')
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
export const validateUuidParam = (paramName: string) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
];

/**
 * Validate common pagination query parameters.
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
