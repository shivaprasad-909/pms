// ============================================
// Tasks Module — Service
// ============================================

import prisma from '../../config/database';
import { Role, TaskStatus, Priority } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../errors/AppError';

export const createTask = async (input: any, userId: string, role: Role) => {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId }, include: { members: true },
  });
  if (!project) throw new NotFoundError('Project');

  if (role === 'MANAGER' && !project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
    throw new ForbiddenError('You can only create tasks in projects you manage');
  }

  const maxPos = await prisma.task.findFirst({
    where: { projectId: input.projectId }, orderBy: { position: 'desc' }, select: { position: true },
  });

  const task = await prisma.$transaction(async (tx) => {
    const newTask = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: (input.priority as Priority) || 'MEDIUM',
        estimatedHours: input.estimatedHours,
        storyPoints: input.storyPoints,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        projectId: input.projectId,
        sprintId: input.sprintId || null,
        labels: input.labels || null,
        position: (maxPos?.position || 0) + 1,
      },
    });

    if (input.assigneeIds?.length > 0) {
      await tx.taskAssignment.createMany({
        data: input.assigneeIds.map((id: string) => ({ taskId: newTask.id, userId: id })),
      });
    }

    if (input.subtasks?.length > 0) {
      await tx.subtask.createMany({
        data: input.subtasks.map((s: any, i: number) => ({
          taskId: newTask.id, title: s.title || s, position: i,
        })),
      });
    }

    return newTask;
  });

  return getTaskById(task.id);
};

export const getTasks = async (filters: any, userId: string, role: Role) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.sprintId) where.sprintId = filters.sprintId;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;

  if (role === 'DEVELOPER') {
    where.assignments = { some: { userId } };
  } else if (role === 'MANAGER') {
    where.project = { members: { some: { userId, role: 'MANAGER' } } };
  }

  if (filters.assigneeId) {
    where.assignments = { some: { userId: filters.assigneeId } };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.overdue === 'true') {
    where.dueDate = { lt: new Date() };
    where.status = { notIn: ['DONE'] };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where, skip, take: limit,
      orderBy: filters.sortBy ? { [filters.sortBy]: filters.sortOrder || 'asc' } : { position: 'asc' },
      include: {
        assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        project: { select: { id: true, name: true, slug: true } },
        sprint: { select: { id: true, name: true, status: true } },
        subtasks: { orderBy: { position: 'asc' } },
        _count: { select: { comments: true, attachments: true, timeLogs: true, subtasks: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getTaskById = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      sprint: { select: { id: true, name: true, status: true } },
      assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } } } },
      comments: {
        where: { parentId: null }, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          replies: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        },
      },
      attachments: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
      timeLogs: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { logDate: 'desc' } },
      subtasks: { orderBy: { position: 'asc' } },
      dependencies: { include: { dependencyTask: { select: { id: true, title: true, status: true } } } },
      dependents: { include: { dependentTask: { select: { id: true, title: true, status: true } } } },
    },
  });
  if (!task) throw new NotFoundError('Task');
  return task;
};

export const updateTask = async (taskId: string, input: any, userId: string, role: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } }, assignments: true },
  });
  if (!task) throw new NotFoundError('Task');

  if (role === 'DEVELOPER') {
    if (!task.assignments.some(a => a.userId === userId)) throw new ForbiddenError('Not assigned to this task');
    const allowed = ['status'];
    if (Object.keys(input).some(k => !allowed.includes(k))) throw new ForbiddenError('Developers can only update task status');
  }

  if (role === 'MANAGER' && !task.project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
    throw new ForbiddenError('You can only update tasks in your projects');
  }

  const data: any = {};
  if (input.title) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status) {
    data.status = input.status as TaskStatus;
    if (input.status === 'DONE') {
      data.completedAt = new Date();
      const totalH = await prisma.timeLog.aggregate({ where: { taskId }, _sum: { hours: true } });
      data.actualHours = totalH._sum.hours || 0;
    }
  }
  if (input.priority) data.priority = input.priority as Priority;
  if (input.estimatedHours !== undefined) data.estimatedHours = input.estimatedHours;
  if (input.storyPoints !== undefined) data.storyPoints = input.storyPoints;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null;
  if (input.sprintId !== undefined) data.sprintId = input.sprintId || null;
  if (input.position !== undefined) data.position = input.position;
  if (input.labels !== undefined) data.labels = input.labels;

  return prisma.task.update({
    where: { id: taskId }, data,
    include: {
      assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      project: { select: { id: true, name: true } },
      subtasks: { orderBy: { position: 'asc' } },
    },
  });
};

export const deleteTask = async (taskId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task');
  await prisma.task.delete({ where: { id: taskId } });
  return { message: 'Task deleted' };
};

export const assignTask = async (taskId: string, userId: string) => {
  return prisma.taskAssignment.create({
    data: { taskId, userId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
};

export const unassignTask = async (taskId: string, userId: string) => {
  await prisma.taskAssignment.delete({ where: { taskId_userId: { taskId, userId } } });
  return { message: 'Unassigned' };
};

export const addComment = async (taskId: string, userId: string, content: string, parentId?: string) => {
  return prisma.taskComment.create({
    data: { content, taskId, userId, parentId: parentId || null },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
};

export const reorderTask = async (taskId: string, position: number, status?: TaskStatus) => {
  const data: any = { position };
  if (status) {
    data.status = status;
    if (status === 'DONE') data.completedAt = new Date();
  }
  return prisma.task.update({
    where: { id: taskId }, data,
    include: { assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } },
  });
};

export const addDependency = async (dependentTaskId: string, dependencyTaskId: string) => {
  if (dependentTaskId === dependencyTaskId) throw new Error('Cannot depend on itself');
  return prisma.taskDependency.create({
    data: { dependentTaskId, dependencyTaskId },
    include: {
      dependentTask: { select: { id: true, title: true } },
      dependencyTask: { select: { id: true, title: true } },
    },
  });
};

export const updateSubtask = async (subtaskId: string, data: any) => {
  return prisma.subtask.update({ where: { id: subtaskId }, data });
};

export const getTaskStats = async (projectId: string) => {
  const [total, byStatus, byPriority, overdue] = await Promise.all([
    prisma.task.count({ where: { projectId } }),
    prisma.task.groupBy({ by: ['status'], where: { projectId }, _count: { status: true } }),
    prisma.task.groupBy({ by: ['priority'], where: { projectId }, _count: { priority: true } }),
    prisma.task.count({ where: { projectId, dueDate: { lt: new Date() }, status: { notIn: ['DONE'] } } }),
  ]);

  return {
    total, overdue,
    byStatus: byStatus.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {} as Record<string, number>),
    byPriority: byPriority.reduce((a, c) => ({ ...a, [c.priority]: c._count.priority }), {} as Record<string, number>),
  };
};

// ─── COMMENTS ────────────────

export const listComments = async (taskId: string) => {
  return prisma.taskComment.findMany({
    where: { taskId, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      replies: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
};

export const updateComment = async (commentId: string, content: string) => {
  return prisma.taskComment.update({
    where: { id: commentId },
    data: { content },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
};

export const deleteComment = async (commentId: string) => {
  await prisma.taskComment.delete({ where: { id: commentId } });
};

// ─── DEPENDENCIES ────────────────

export const listDependencies = async (taskId: string) => {
  const [blocking, blockedBy] = await Promise.all([
    prisma.taskDependency.findMany({
      where: { dependencyTaskId: taskId },
      include: { dependentTask: { select: { id: true, title: true, status: true, priority: true } } },
    }),
    prisma.taskDependency.findMany({
      where: { dependentTaskId: taskId },
      include: { dependencyTask: { select: { id: true, title: true, status: true, priority: true } } },
    }),
  ]);
  return { blocking, blockedBy };
};

export const removeDependency = async (dependencyId: string) => {
  await prisma.taskDependency.delete({ where: { id: dependencyId } });
};

// ─── SUBTASKS ────────────────

export const listSubtasks = async (taskId: string) => {
  return prisma.subtask.findMany({
    where: { taskId },
    orderBy: { position: 'asc' },
  });
};

export const createSubtask = async (taskId: string, data: any) => {
  const maxPos = await prisma.subtask.findFirst({
    where: { taskId }, orderBy: { position: 'desc' }, select: { position: true },
  });
  return prisma.subtask.create({
    data: {
      title: data.title,
      isCompleted: data.isCompleted || false,
      position: (maxPos?.position || 0) + 1,
      taskId,
    },
  });
};

export const deleteSubtask = async (subtaskId: string) => {
  await prisma.subtask.delete({ where: { id: subtaskId } });
};

// ─── TIME LOGS ────────────────

export const listTimeLogs = async (taskId: string) => {
  return prisma.timeLog.findMany({
    where: { taskId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    orderBy: { logDate: 'desc' },
  });
};

export const createTimeLog = async (taskId: string, userId: string, data: any) => {
  return prisma.timeLog.create({
    data: {
      hours: data.hours,
      description: data.description,
      logDate: new Date(data.logDate || new Date()),
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      taskId,
      userId,
    },
    include: {
      task: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// ─── ATTACHMENTS ────────────────

export const listAttachments = async (taskId: string) => {
  return prisma.taskAttachment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

