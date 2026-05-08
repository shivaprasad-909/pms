import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';

// ─── TIME LOGS ────────────────

export const timeLogRoutes = Router();
timeLogRoutes.use(authenticate);

timeLogRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = {};
  if (user.role === 'DEVELOPER') where.userId = user.userId;
  if (req.query.taskId) where.taskId = req.query.taskId as string;
  if (req.query.userId) where.userId = req.query.userId as string;
  if (req.query.from) where.logDate = { ...where.logDate, gte: new Date(req.query.from as string) };
  if (req.query.to) where.logDate = { ...where.logDate, lte: new Date(req.query.to as string) };

  const logs = await prisma.timeLog.findMany({
    where, orderBy: { logDate: 'desc' }, take: 100,
    include: {
      task: { select: { id: true, title: true, project: { select: { id: true, name: true } } } },
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });
  sendResponse({ res, data: logs });
}));

timeLogRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const log = await prisma.timeLog.create({
    data: {
      hours: req.body.hours,
      description: req.body.description,
      logDate: new Date(req.body.logDate || new Date()),
      startTime: req.body.startTime ? new Date(req.body.startTime) : null,
      endTime: req.body.endTime ? new Date(req.body.endTime) : null,
      taskId: req.body.taskId,
      userId: user.userId,
    },
    include: {
      task: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  sendResponse({ res, statusCode: 201, data: log });
}));

timeLogRoutes.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const log = await prisma.timeLog.update({ where: { id: p(req.params.id) }, data: req.body });
  sendResponse({ res, data: log });
}));

timeLogRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.timeLog.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'Time log deleted' });
}));

// ─── ACTIVITY LOGS ────────────────

export const activityLogRoutes = Router();
activityLogRoutes.use(authenticate);

activityLogRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = {};

  if (user.role === 'DEVELOPER') {
    where.userId = user.userId;
  } else if (user.role === 'MANAGER') {
    const myProjects = await prisma.projectMember.findMany({ where: { userId: user.userId, role: 'MANAGER' }, select: { projectId: true } });
    where.projectId = { in: myProjects.map((mp: any) => mp.projectId) };
  } else {
    where.organizationId = user.organizationId;
  }

  if (req.query.userId) where.userId = req.query.userId as string;
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  if (req.query.action) where.action = req.query.action as string;
  if (req.query.entityType) where.entityType = req.query.entityType as string;
  if (req.query.from) where.createdAt = { ...where.createdAt, gte: new Date(req.query.from as string) };
  if (req.query.to) where.createdAt = { ...where.createdAt, lte: new Date(req.query.to as string) };

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  sendResponse({ res, data: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

// ─── NOTIFICATIONS ────────────────

export const notificationRoutes = Router();
notificationRoutes.use(authenticate);

notificationRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifications = await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' }, take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: user.userId, isRead: false } });
  sendResponse({ res, data: { notifications, unreadCount } });
}));

notificationRoutes.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const notif = await prisma.notification.update({
    where: { id: p(req.params.id) }, data: { isRead: req.body.isRead ?? true },
  });
  sendResponse({ res, data: notif });
}));

notificationRoutes.post('/mark-all-read', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await prisma.notification.updateMany({ where: { userId: user.userId, isRead: false }, data: { isRead: true } });
  sendResponse({ res, message: 'All marked as read' });
}));

// ─── CHAT / CHANNELS ────────────────

export const chatRoutes = Router();
chatRoutes.use(authenticate);

chatRoutes.get('/channels', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const channels = await prisma.chatChannel.findMany({
    where: { organizationId: user.organizationId, members: { some: { userId: user.userId } } },
    include: {
      _count: { select: { members: true, messages: true } },
      project: { select: { id: true, name: true } },
      messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true, user: { select: { firstName: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  sendResponse({ res, data: channels });
}));

chatRoutes.post('/channels', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const channel = await prisma.chatChannel.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type || 'TEAM',
      organizationId: user.organizationId,
      projectId: req.body.projectId,
      members: { create: { userId: user.userId } },
    },
  });
  sendResponse({ res, statusCode: 201, data: channel });
}));

chatRoutes.get('/channels/:channelId/messages', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const messages = await prisma.channelMessage.findMany({
    where: { channelId: p(req.params.channelId) },
    skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
  });
  sendResponse({ res, data: messages.reverse() });
}));

chatRoutes.post('/channels/:channelId/messages', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const msg = await prisma.channelMessage.create({
    data: {
      content: req.body.content,
      channelId: p(req.params.channelId),
      userId: user.userId,
      mentions: req.body.mentions,
      parentId: req.body.parentId,
    },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
  // Emit real-time message event
  const io = req.app.get('io');
  if (io) io.to(`channel:${req.params.channelId}`).emit('message:created', msg);
  sendResponse({ res, statusCode: 201, data: msg });
}));

chatRoutes.post('/channels/:channelId/members', asyncHandler(async (req: Request, res: Response) => {
  const member = await prisma.channelMember.create({
    data: { channelId: p(req.params.channelId), userId: req.body.userId },
  });
  sendResponse({ res, statusCode: 201, data: member });
}));

// ─── SEARCH ────────────────

export const searchRoutes = Router();
searchRoutes.use(authenticate);

searchRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const q = (req.query.q as string) || '';
  const types = ((req.query.types as string) || 'tasks,projects,users').split(',');

  if (!q || q.length < 2) {
    sendResponse({ res, data: { tasks: [], projects: [], users: [] } });
    return;
  }

  const results: any = {};

  if (types.includes('tasks')) {
    const taskWhere: any = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (user.role === 'DEVELOPER') taskWhere.assignments = { some: { userId: user.userId } };
    else if (user.role === 'MANAGER') taskWhere.project = { members: { some: { userId: user.userId } } };
    else taskWhere.project = { organizationId: user.organizationId };

    results.tasks = await prisma.task.findMany({
      where: taskWhere, take: 10,
      select: { id: true, title: true, status: true, priority: true, project: { select: { id: true, name: true } } },
    });
  }

  if (types.includes('projects')) {
    const projWhere: any = {
      organizationId: user.organizationId,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (user.role === 'MANAGER' || user.role === 'DEVELOPER') {
      projWhere.members = { some: { userId: user.userId } };
    }
    results.projects = await prisma.project.findMany({
      where: projWhere, take: 10,
      select: { id: true, name: true, status: true, slug: true },
    });
  }

  if (types.includes('users') && ['FOUNDER', 'ADMIN', 'MANAGER'].includes(user.role)) {
    results.users = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, firstName: true, lastName: true, email: true, role: true, avatar: true },
    });
  }

  sendResponse({ res, data: results });
}));
