// ============================================
// TypeScript Type Definitions
// ============================================
// Shared types used across the application.
// These types extend Express and define custom
// interfaces for our API.
// ============================================

import { Role } from '@prisma/client';
import { Request } from 'express';

// ============================================
// Authentication Types
// ============================================

/**
 * JWT payload structure — the data stored inside 
 * our access and refresh tokens.
 */
export interface JwtPayload {
  userId: string;         // User's unique ID
  email: string;          // User's email address
  role: Role;             // User's role (FOUNDER, ADMIN, etc.)
  organizationId: string; // User's organization
  permissions: string[];  // Granular UI and API access strings
}

/**
 * Extended Express Request that includes the 
 * authenticated user information after JWT verification.
 */
export interface AuthRequest extends Request {
  user?: JwtPayload; // Set by auth middleware after token verification
}

// ============================================
// API Response Types
// ============================================

/**
 * Standard API success response format.
 * All API responses follow this structure for consistency.
 */
export interface ApiResponse<T = any> {
  success: boolean;    // Was the request successful?
  message: string;     // Human-readable message
  data?: T;           // Response data (if any)
}

/**
 * Paginated API response for list endpoints.
 * Extends ApiResponse with pagination metadata.
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;      // Current page number
    limit: number;     // Items per page
    total: number;     // Total items across all pages
    totalPages: number; // Total number of pages
  };
}

// ============================================
// Query Parameter Types
// ============================================

/**
 * Common pagination parameters for list endpoints.
 */
export interface PaginationParams {
  page?: number;   // Page number (default: 1)
  limit?: number;  // Items per page (default: 10)
}

/**
 * Common filter parameters for list endpoints.
 */
export interface FilterParams extends PaginationParams {
  search?: string;    // Search term
  sortBy?: string;    // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Sort direction
}

// ============================================
// User Types
// ============================================

/**
 * Data needed to create a new user.
 */
export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  designation?: string;
  organizationId: string;
}

/**
 * Data that can be updated for a user.
 */
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  avatar?: string;
  isActive?: boolean;
  role?: Role;
}

// ============================================
// Project Types
// ============================================

export interface CreateProjectInput {
  name: string;
  description?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

// ============================================
// Task Types
// ============================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  estimatedHours?: number;
  dueDate?: string;
  projectId: string;
  sprintId?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  estimatedHours?: number;
  dueDate?: string;
  sprintId?: string;
  position?: number;
}

// ============================================
// Sprint Types
// ============================================

export interface CreateSprintInput {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  projectId: string;
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Time Log Types
// ============================================

export interface CreateTimeLogInput {
  hours: number;
  description?: string;
  logDate: string;
  taskId: string;
}

// ============================================
// Message Types
// ============================================

export interface CreateMessageInput {
  content: string;
  receiverId: string;
}

// ============================================
// Automation Types
// ============================================

export interface CreateAutomationInput {
  name: string;
  description?: string;
  trigger: string;
  triggerConfig?: object;
  action: string;
  actionConfig?: object;
  projectId: string;
}
