// ============================================
// Teams Module — Full CRUD + Members
// ============================================

import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';
import { managerOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

// GET /teams
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const teams = await prisma.team.findMany({
    where: { organizationId: user.organizationId },
    include: {
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
        take: 10,
      },
      _count: { select: { members: true } },
    },
    orderBy: { name: 'asc' },
  });
  sendResponse({ res, data: teams });
}));

// POST /teams
router.post('/', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { createSlug, generateUniqueSlug } = await import('../../utils/helpers');
  let slug = createSlug(req.body.name);
  const existing = await prisma.team.findUnique({ where: { slug } });
  if (existing) slug = generateUniqueSlug(slug);

  const team = await prisma.team.create({
    data: {
      name: req.body.name,
      slug,
      description: req.body.description,
      avatar: req.body.avatar,
      color: req.body.color,
      organizationId: user.organizationId,
      members: { create: { userId: user.userId, role: 'lead' } },
    },
    include: {
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      _count: { select: { members: true } },
    },
  });
  sendResponse({ res, statusCode: 201, message: 'Team created', data: team });
}));

// GET /teams/:teamId
router.get('/:teamId', asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { id: p(req.params.teamId) },
    include: {
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true, designation: true } } },
      },
      _count: { select: { members: true } },
    },
  });
  if (!team) { sendResponse({ res, statusCode: 404, message: 'Team not found' }); return; }
  sendResponse({ res, data: team });
}));

// PATCH /teams/:teamId
router.patch('/:teamId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.avatar !== undefined) data.avatar = req.body.avatar;
  if (req.body.color !== undefined) data.color = req.body.color;

  const team = await prisma.team.update({ where: { id: p(req.params.teamId) }, data });
  sendResponse({ res, message: 'Team updated', data: team });
}));

// DELETE /teams/:teamId
router.delete('/:teamId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.team.delete({ where: { id: p(req.params.teamId) } });
  sendResponse({ res, message: 'Team deleted' });
}));

// GET /teams/:teamId/members
router.get('/:teamId/members', asyncHandler(async (req: Request, res: Response) => {
  const members = await prisma.teamMember.findMany({
    where: { teamId: p(req.params.teamId) },
    include: {
      user: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          avatar: true, role: true, designation: true, department: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });
  sendResponse({ res, data: members });
}));

// POST /teams/:teamId/members
router.post('/:teamId/members', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const member = await prisma.teamMember.create({
    data: {
      teamId: p(req.params.teamId),
      userId: req.body.userId,
      role: req.body.role || 'member',
    },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
  sendResponse({ res, statusCode: 201, message: 'Member added', data: member });
}));

// DELETE /teams/:teamId/members/:userId
router.delete('/:teamId/members/:userId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: p(req.params.teamId), userId: p(req.params.userId) } },
  });
  sendResponse({ res, message: 'Member removed' });
}));

export default router;
