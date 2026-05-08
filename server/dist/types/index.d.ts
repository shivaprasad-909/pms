import { Role } from '@prisma/client';
import { Request } from 'express';
/**
 * JWT payload structure — the data stored inside
 * our access and refresh tokens.
 */
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
    organizationId: string;
    permissions: string[];
}
/**
 * Extended Express Request that includes the
 * authenticated user information after JWT verification.
 */
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
/**
 * Standard API success response format.
 * All API responses follow this structure for consistency.
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}
/**
 * Paginated API response for list endpoints.
 * Extends ApiResponse with pagination metadata.
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
/**
 * Common pagination parameters for list endpoints.
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}
/**
 * Common filter parameters for list endpoints.
 */
export interface FilterParams extends PaginationParams {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
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
export interface CreateTimeLogInput {
    hours: number;
    description?: string;
    logDate: string;
    taskId: string;
}
export interface CreateMessageInput {
    content: string;
    receiverId: string;
}
export interface CreateAutomationInput {
    name: string;
    description?: string;
    trigger: string;
    triggerConfig?: object;
    action: string;
    actionConfig?: object;
    projectId: string;
}
//# sourceMappingURL=index.d.ts.map