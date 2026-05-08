// ============================================
// Chat Module — Complete CRUD for Channels,
// Messages, and Members
// ============================================

import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── CHANNELS ────────────────

// GET /chat/channels
router.get('/channels', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const channels = await prisma.chatChannel.findMany({
    where: { organizationId: user.organizationId, members: { some: { userId: user.userId } } },
    include: {
      _count: { select: { members: true, messages: true } },
      project: { select: { id: true, name: true } },
      messages: {
        take: 1, orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true, user: { select: { firstName: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  sendResponse({ res, data: channels });
}));

// POST /chat/channels
router.post('/channels', asyncHandler(async (req: Request, res: Response) => {
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
    include: { _count: { select: { members: true } } },
  });
  sendResponse({ res, statusCode: 201, data: channel });
}));

// GET /chat/channels/:channelId
router.get('/channels/:channelId', asyncHandler(async (req: Request, res: Response) => {
  const channel = await prisma.chatChannel.findUnique({
    where: { id: p(req.params.channelId) },
    include: {
      _count: { select: { members: true, messages: true } },
      project: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      },
    },
  });
  if (!channel) { sendResponse({ res, statusCode: 404, message: 'Channel not found' }); return; }
  sendResponse({ res, data: channel });
}));

// PATCH /chat/channels/:channelId
router.patch('/channels/:channelId', asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;

  const channel = await prisma.chatChannel.update({ where: { id: p(req.params.channelId) }, data });
  sendResponse({ res, message: 'Channel updated', data: channel });
}));

// DELETE /chat/channels/:channelId
router.delete('/channels/:channelId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.chatChannel.delete({ where: { id: p(req.params.channelId) } });
  sendResponse({ res, message: 'Channel deleted' });
}));

// ─── MESSAGES ────────────────

// GET /chat/channels/:channelId/messages
router.get('/channels/:channelId/messages', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const [messages, total] = await Promise.all([
    prisma.channelMessage.findMany({
      where: { channelId: p(req.params.channelId) },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
    }),
    prisma.channelMessage.count({ where: { channelId: p(req.params.channelId) } }),
  ]);
  sendResponse({ res, data: messages.reverse(), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

// POST /chat/channels/:channelId/messages
router.post('/channels/:channelId/messages', asyncHandler(async (req: Request, res: Response) => {
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
  // Update channel timestamp
  await prisma.chatChannel.update({ where: { id: p(req.params.channelId) }, data: { updatedAt: new Date() } });
  // Emit real-time event
  const io = req.app.get('io');
  if (io) io.to(`channel:${req.params.channelId}`).emit('message:created', msg);
  sendResponse({ res, statusCode: 201, data: msg });
}));

// PATCH /chat/channels/:channelId/messages/:messageId
router.patch('/channels/:channelId/messages/:messageId', asyncHandler(async (req: Request, res: Response) => {
  const msg = await prisma.channelMessage.update({
    where: { id: p(req.params.messageId) },
    data: { content: req.body.content },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
  const io = req.app.get('io');
  if (io) io.to(`channel:${req.params.channelId}`).emit('message:updated', msg);
  sendResponse({ res, message: 'Message updated', data: msg });
}));

// DELETE /chat/channels/:channelId/messages/:messageId
router.delete('/channels/:channelId/messages/:messageId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.channelMessage.delete({ where: { id: p(req.params.messageId) } });
  const io = req.app.get('io');
  if (io) io.to(`channel:${req.params.channelId}`).emit('message:deleted', { id: p(req.params.messageId) });
  sendResponse({ res, message: 'Message deleted' });
}));

// ─── CHANNEL MEMBERS ────────────────

// GET /chat/channels/:channelId/members
router.get('/channels/:channelId/members', asyncHandler(async (req: Request, res: Response) => {
  const members = await prisma.channelMember.findMany({
    where: { channelId: p(req.params.channelId) },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
  });
  sendResponse({ res, data: members });
}));

// POST /chat/channels/:channelId/members
router.post('/channels/:channelId/members', asyncHandler(async (req: Request, res: Response) => {
  const member = await prisma.channelMember.create({
    data: { channelId: p(req.params.channelId), userId: req.body.userId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
  sendResponse({ res, statusCode: 201, data: member });
}));

// DELETE /chat/channels/:channelId/members/:userId
router.delete('/channels/:channelId/members/:userId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.channelMember.deleteMany({
    where: { channelId: p(req.params.channelId), userId: p(req.params.userId) },
  });
  sendResponse({ res, message: 'Member removed from channel' });
}));

export default router;
