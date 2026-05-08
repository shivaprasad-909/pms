// ============================================
// Workspace Module — Full CRUD
// ============================================

import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';
import { adminOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

// GET /workspaces
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const workspaces = await prisma.workspace.findMany({
    where: { organizationId: user.organizationId, isArchived: false },
    include: {
      _count: { select: { projects: true } },
    },
    orderBy: { name: 'asc' },
  });
  sendResponse({ res, data: workspaces });
}));

// POST /workspaces
router.post('/', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { createSlug, generateUniqueSlug } = await import('../../utils/helpers');
  let slug = createSlug(req.body.name);
  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) slug = generateUniqueSlug(slug);

  const workspace = await prisma.workspace.create({
    data: {
      name: req.body.name,
      slug,
      description: req.body.description,
      color: req.body.color,
      organizationId: user.organizationId,
    },
  });
  sendResponse({ res, statusCode: 201, message: 'Workspace created', data: workspace });
}));

// GET /workspaces/:workspaceId
router.get('/:workspaceId', asyncHandler(async (req: Request, res: Response) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: p(req.params.workspaceId) },
    include: {
      projects: {
        include: {
          _count: { select: { tasks: true, members: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      _count: { select: { projects: true } },
    },
  });
  if (!workspace) { sendResponse({ res, statusCode: 404, message: 'Workspace not found' }); return; }
  sendResponse({ res, data: workspace });
}));

// PATCH /workspaces/:workspaceId
router.patch('/:workspaceId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.color !== undefined) data.color = req.body.color;
  if (req.body.isArchived !== undefined) data.isArchived = req.body.isArchived;

  const workspace = await prisma.workspace.update({
    where: { id: p(req.params.workspaceId) },
    data,
  });
  sendResponse({ res, message: 'Workspace updated', data: workspace });
}));

// DELETE /workspaces/:workspaceId
router.delete('/:workspaceId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.workspace.delete({ where: { id: p(req.params.workspaceId) } });
  sendResponse({ res, message: 'Workspace deleted' });
}));

export default router;
