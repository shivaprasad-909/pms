// ============================================
// Projects Module — Service
// ============================================

import prisma from '../../config/database';
import { Role, ProjectStatus, Priority } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../errors/AppError';
import { createSlug, generateUniqueSlug } from '../../utils/helpers';

export const createProject = async (input: any, userId: string, organizationId: string) => {
  let slug = createSlug(input.name);
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) slug = generateUniqueSlug(slug);

  const project = await prisma.$transaction(async (tx) => {
    const proj = await tx.project.create({
      data: {
        name: input.name, slug,
        description: input.description,
        priority: (input.priority as Priority) || 'MEDIUM',
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        budget: input.budget,
        organizationId, createdById: userId,
      },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    // Create default board with columns
    const board = await tx.board.create({
      data: {
        name: 'Default Board', projectId: proj.id,
        columns: {
          createMany: {
            data: [
              { name: 'To Do', color: '#636E72', position: 0, taskStatus: 'TODO' },
              { name: 'In Progress', color: '#6C5CE7', position: 1, taskStatus: 'IN_PROGRESS' },
              { name: 'In Review', color: '#F39C12', position: 2, taskStatus: 'IN_REVIEW' },
              { name: 'Done', color: '#00B894', position: 3, taskStatus: 'DONE' },
            ],
          },
        },
      },
    });

    // Create project channel
    await tx.chatChannel.create({
      data: {
        name: input.name, type: 'PROJECT',
        organizationId, projectId: proj.id,
        members: { create: { userId } },
      },
    });

    return proj;
  });

  return project;
};

export const getProjects = async (userId: string, role: Role, organizationId: string, filters: any) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const where: any = { organizationId };
  if (role === 'MANAGER' || role === 'DEVELOPER') {
    where.members = { some: { userId } };
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, skip, take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
          take: 8,
        },
        _count: { select: { tasks: true, sprints: true, members: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  // Calculate progress for each project
  const projectsWithProgress = await Promise.all(projects.map(async (p) => {
    const taskStats = await prisma.task.groupBy({
      by: ['status'], where: { projectId: p.id }, _count: { status: true },
    });
    const total = taskStats.reduce((s, t) => s + t._count.status, 0);
    const done = taskStats.find(t => t.status === 'DONE')?._count.status || 0;
    return { ...p, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }));

  return { projects: projectsWithProgress, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getProjectById = async (projectId: string, userId: string, role: Role) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true, designation: true } } },
      },
      sprints: { orderBy: { startDate: 'desc' } },
      boards: { include: { columns: { orderBy: { position: 'asc' } } } },
      _count: { select: { tasks: true, sprints: true, documents: true, members: true } },
    },
  });

  if (!project) throw new NotFoundError('Project');
  if ((role === 'MANAGER' || role === 'DEVELOPER') && !project.members.some(m => m.userId === userId)) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Task stats
  const taskStats = await prisma.task.groupBy({
    by: ['status'], where: { projectId }, _count: { status: true },
  });
  const totalTasks = taskStats.reduce((s, t) => s + t._count.status, 0);
  const doneTasks = taskStats.find(t => t.status === 'DONE')?._count.status || 0;
  const overdueTasks = await prisma.task.count({
    where: { projectId, dueDate: { lt: new Date() }, status: { notIn: ['DONE'] } },
  });

  return {
    ...project,
    progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    taskStats: {
      total: totalTasks, overdue: overdueTasks,
      byStatus: taskStats.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {} as Record<string, number>),
    },
  };
};

export const updateProject = async (projectId: string, input: any, userId: string, role: Role) => {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: true } });
  if (!project) throw new NotFoundError('Project');
  if (role === 'MANAGER' && !project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
    throw new ForbiddenError('You can only edit projects you manage');
  }

  const updateData: any = {};
  if (input.name) {
    updateData.name = input.name;
    let slug = createSlug(input.name);
    const exists = await prisma.project.findFirst({ where: { slug, id: { not: projectId } } });
    updateData.slug = exists ? generateUniqueSlug(slug) : slug;
  }
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status) {
    updateData.status = input.status as ProjectStatus;
    if (input.status === 'COMPLETED') updateData.completedAt = new Date();
  }
  if (input.priority) updateData.priority = input.priority as Priority;
  if (input.startDate) updateData.startDate = new Date(input.startDate);
  if (input.endDate) updateData.endDate = new Date(input.endDate);
  if (input.budget !== undefined) updateData.budget = input.budget;

  return prisma.project.update({
    where: { id: projectId }, data: updateData,
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
    },
  });
};

export const deleteProject = async (projectId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  await prisma.project.delete({ where: { id: projectId } });
  return { message: 'Project deleted successfully' };
};

export const addProjectMember = async (projectId: string, userId: string, memberRole: Role) => {
  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (existing) throw new Error('User is already a member');

  return prisma.projectMember.create({
    data: { userId, projectId, role: memberRole },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
  });
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  await prisma.projectMember.delete({ where: { userId_projectId: { userId, projectId } } });
  return { message: 'Member removed' };
};

export const getProjectMembers = async (projectId: string) => {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          role: true, avatar: true, designation: true, department: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });
};

export const updateProjectMemberRole = async (projectId: string, userId: string, newRole: Role) => {
  return prisma.projectMember.update({
    where: { userId_projectId: { userId, projectId } },
    data: { role: newRole },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
  });
};

export const getProjectTimeSummary = async (projectId: string) => {
  const timeLogs = await prisma.timeLog.findMany({
    where: { task: { projectId } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      task: { select: { id: true, title: true } },
    },
  });

  const totalHours = timeLogs.reduce((s, l) => s + l.hours, 0);

  // Group by user
  const byUser: Record<string, { name: string; hours: number }> = {};
  timeLogs.forEach(l => {
    const key = l.user.id;
    if (!byUser[key]) byUser[key] = { name: `${l.user.firstName} ${l.user.lastName}`, hours: 0 };
    byUser[key].hours += l.hours;
  });

  // Group by task
  const byTask: Record<string, { title: string; hours: number }> = {};
  timeLogs.forEach(l => {
    const key = l.task.id;
    if (!byTask[key]) byTask[key] = { title: l.task.title, hours: 0 };
    byTask[key].hours += l.hours;
  });

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    byUser: Object.values(byUser).sort((a, b) => b.hours - a.hours),
    byTask: Object.values(byTask).sort((a, b) => b.hours - a.hours),
    totalEntries: timeLogs.length,
  };
};

export const submitForCompletion = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: true } });
  if (!project) throw new NotFoundError('Project');
  if (!project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
    throw new ForbiddenError('Only the project manager can submit for completion');
  }
  return prisma.project.update({ where: { id: projectId }, data: { status: 'PENDING_APPROVAL' } });
};

export const approveCompletion = async (projectId: string) => {
  return prisma.project.update({
    where: { id: projectId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
};

export const rejectCompletion = async (projectId: string, reason: string) => {
  return prisma.project.update({
    where: { id: projectId },
    data: { status: 'ACTIVE' },
  });
};
