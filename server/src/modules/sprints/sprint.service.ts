// ============================================
// Sprints Module — Service + Controller + Routes
// ============================================

import prisma from '../../config/database';
import { SprintStatus } from '@prisma/client';
import { NotFoundError } from '../../errors/AppError';

export const createSprint = async (input: any) => {
  return prisma.sprint.create({
    data: {
      name: input.name, goal: input.goal,
      startDate: new Date(input.startDate), endDate: new Date(input.endDate),
      projectId: input.projectId,
    },
    include: { project: { select: { id: true, name: true } }, _count: { select: { tasks: true } } },
  });
};

export const getSprints = async (filters: any) => {
  const where: any = {};
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.status) where.status = filters.status;

  return prisma.sprint.findMany({
    where, orderBy: { startDate: 'desc' },
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
      tasks: {
        select: { id: true, status: true, storyPoints: true },
      },
    },
  });
};

export const getSprintById = async (id: string) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      tasks: {
        orderBy: { position: 'asc' },
        include: {
          assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          _count: { select: { comments: true, subtasks: true } },
        },
      },
    },
  });
  if (!sprint) throw new NotFoundError('Sprint');

  // Compute analytics
  const analytics = {
    total: sprint.tasks.length,
    todo: sprint.tasks.filter(t => t.status === 'TODO').length,
    inProgress: sprint.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    inReview: sprint.tasks.filter(t => t.status === 'IN_REVIEW').length,
    done: sprint.tasks.filter(t => t.status === 'DONE').length,
    blocked: sprint.tasks.filter(t => t.status === 'BLOCKED').length,
    totalPoints: sprint.tasks.reduce((s, t) => s + (t.storyPoints || 0), 0),
    completedPoints: sprint.tasks.filter(t => t.status === 'DONE').reduce((s, t) => s + (t.storyPoints || 0), 0),
  };

  return { ...sprint, analytics };
};

export const updateSprint = async (id: string, data: any) => {
  const update: any = {};
  if (data.name) update.name = data.name;
  if (data.goal !== undefined) update.goal = data.goal;
  if (data.status) update.status = data.status as SprintStatus;
  if (data.startDate) update.startDate = new Date(data.startDate);
  if (data.endDate) update.endDate = new Date(data.endDate);
  return prisma.sprint.update({ where: { id }, data: update });
};

export const deleteSprint = async (id: string) => {
  await prisma.sprint.delete({ where: { id } });
  return { message: 'Sprint deleted' };
};

export const addTasksToSprint = async (sprintId: string, taskIds: string[]) => {
  await prisma.task.updateMany({ where: { id: { in: taskIds } }, data: { sprintId } });
  return { message: `${taskIds.length} tasks added to sprint` };
};

export const removeTaskFromSprint = async (sprintId: string, taskId: string) => {
  await prisma.task.update({ where: { id: taskId }, data: { sprintId: null } });
  return { message: 'Task removed from sprint' };
};

export const getSprintBurndown = async (sprintId: string) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { tasks: { select: { storyPoints: true, status: true, completedAt: true, createdAt: true } } },
  });
  if (!sprint) return null;

  const dayjs = (await import('dayjs')).default;
  const totalPoints = sprint.tasks.reduce((s, t) => s + (t.storyPoints || 1), 0);
  const days = dayjs(sprint.endDate).diff(dayjs(sprint.startDate), 'day') + 1;
  const burndown: { day: number; date: string; ideal: number; actual: number }[] = [];

  for (let i = 0; i < days; i++) {
    const d = dayjs(sprint.startDate).add(i, 'day');
    const completedByDay = sprint.tasks.filter(t =>
      t.completedAt && dayjs(t.completedAt).isBefore(d.endOf('day'))
    ).reduce((s, t) => s + (t.storyPoints || 1), 0);

    burndown.push({
      day: i + 1,
      date: d.format('MMM DD'),
      ideal: Math.round(totalPoints - (totalPoints / days) * (i + 1)),
      actual: d.isBefore(dayjs()) || d.isSame(dayjs(), 'day') ? totalPoints - completedByDay : 0,
    });
  }

  return { sprint: { id: sprint.id, name: sprint.name }, totalPoints, burndown };
};

export const getSprintVelocity = async (sprintId: string) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      project: { select: { id: true, name: true } },
      tasks: { select: { storyPoints: true, status: true } },
    },
  });
  if (!sprint) return null;

  const completedPoints = sprint.tasks
    .filter(t => t.status === 'DONE')
    .reduce((s, t) => s + (t.storyPoints || 0), 0);
  const totalPoints = sprint.tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

  return {
    sprintId: sprint.id,
    name: sprint.name,
    project: sprint.project,
    completedPoints,
    totalPoints,
    completedTasks: sprint.tasks.filter(t => t.status === 'DONE').length,
    totalTasks: sprint.tasks.length,
    velocity: completedPoints,
  };
};

export const swapSprint = async (fromSprintId: string, toSprintId: string) => {
  const incompleteTasks = await prisma.task.findMany({
    where: { sprintId: fromSprintId, status: { notIn: ['DONE'] } },
    select: { id: true },
  });

  await prisma.task.updateMany({
    where: { id: { in: incompleteTasks.map(t => t.id) } },
    data: { sprintId: toSprintId },
  });

  return { message: `${incompleteTasks.length} incomplete tasks moved to target sprint` };
};

