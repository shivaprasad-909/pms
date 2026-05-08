// ============================================
// Frontend TypeScript Types
// ============================================

// User & Auth Types
export type Role = 'FOUNDER' | 'ADMIN' | 'MANAGER' | 'DEVELOPER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  phone?: string;
  designation?: string;
  isActive: boolean;
  organizationId: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  organization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Project Types
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  budget?: number;
  createdBy: { id: string; firstName: string; lastName: string; email?: string };
  members: ProjectMember[];
  _count?: { tasks: number; sprints: number; documents?: number; members?: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: Role;
  joinedAt: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string; role: Role; email?: string; designation?: string };
}

// Task Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  position: number;
  projectId: string;
  sprintId?: string;
  project?: { id: string; name: string; slug?: string };
  sprint?: { id: string; name: string; status?: string };
  assignments: TaskAssignment[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  timeLogs?: TimeLog[];
  dependencies?: TaskDependencyInfo[];
  dependents?: TaskDependentInfo[];
  _count?: { comments: number; attachments: number; timeLogs: number };
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  assignedAt: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string; email?: string; role?: Role };
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  parentId?: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  replies?: TaskComment[];
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  user: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface TaskDependencyInfo {
  id: string;
  dependencyTask: { id: string; title: string; status: TaskStatus };
}

export interface TaskDependentInfo {
  id: string;
  dependentTask: { id: string; title: string; status: TaskStatus };
}

// Sprint Types
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  projectId: string;
  tasks?: Task[];
  _count?: { tasks: number };
  analytics?: { total: number; todo: number; inProgress: number; inReview: number; done: number; blocked: number };
}

// Time Log Types
export interface TimeLog {
  id: string;
  hours: number;
  description?: string;
  logDate: string;
  taskId: string;
  userId: string;
  task?: { id: string; title: string; project?: { id: string; name: string } };
  user?: { id: string; firstName: string; lastName: string; avatar?: string };
  createdAt: string;
}

// Activity Log Types
export type ActivityAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENTED' | 'UPLOADED' | 'APPROVED' | 'REJECTED' | 'LOGGED_TIME';
export type EntityType = 'USER' | 'PROJECT' | 'TASK' | 'SPRINT' | 'COMMENT' | 'DOCUMENT';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  details?: Record<string, unknown>;
  userId: string;
  projectId?: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string; role: Role };
  project?: { id: string; name: string };
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  link?: string;
  createdAt: string;
}

// Message Types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  sender: { id: string; firstName: string; lastName: string; avatar?: string };
  receiver: { id: string; firstName: string; lastName: string; avatar?: string };
  createdAt: string;
}

export interface Conversation {
  contact: { id: string; firstName: string; lastName: string; avatar?: string; role: Role; isActive: boolean };
  lastMessage: Message;
  unreadCount: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// Dashboard Types
export interface DashboardData {
  type: 'organization' | 'manager' | 'developer';
  stats: Record<string, number>;
  [key: string]: unknown;
}
