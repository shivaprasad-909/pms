// ============================================
// Organization Module — Routes + Controller
// ============================================

import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { authenticate } from '../../middleware/auth';
import { adminOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

// GET /organization — Current organization
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    include: {
      _count: { select: { users: true, projects: true, teams: true, workspaces: true } },
    },
  });
  sendResponse({ res, data: org });
}));

// PATCH /organization — Update org (Founder/Admin)
router.patch('/', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.logo !== undefined) data.logo = req.body.logo;
  if (req.body.website !== undefined) data.website = req.body.website;
  if (req.body.timezone !== undefined) data.timezone = req.body.timezone;

  const org = await prisma.organization.update({
    where: { id: user.organizationId },
    data,
  });
  sendResponse({ res, message: 'Organization updated', data: org });
}));

// GET /organization/members — Org members (Admin/Founder)
router.get('/members', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const where: any = { organizationId: user.organizationId };
  if (req.query.search) {
    where.OR = [
      { firstName: { contains: req.query.search as string, mode: 'insensitive' } },
      { lastName: { contains: req.query.search as string, mode: 'insensitive' } },
      { email: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }
  if (req.query.role) where.role = req.query.role;
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatar: true, isActive: true, designation: true,
        department: true, lastLoginAt: true, createdAt: true,
        _count: { select: { taskAssignments: true, managedProjects: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  sendResponse({ res, data: members, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

// POST /organization/invite — Invite user (Admin/Founder)
router.post('/invite', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { email, firstName, lastName, role, designation, department } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    sendResponse({ res, statusCode: 409, message: 'User with this email already exists' });
    return;
  }

  const { hashPassword } = await import('../../utils/helpers');
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  const hashedPassword = await hashPassword(tempPassword);

  const newUser = await prisma.user.create({
    data: {
      email, firstName, lastName,
      password: hashedPassword,
      role: role || 'DEVELOPER',
      designation, department,
      organizationId: user.organizationId,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, designation: true, department: true, createdAt: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      action: 'INVITED', entityType: 'USER', entityId: newUser.id,
      userId: user.userId, organizationId: user.organizationId,
      details: { invitedEmail: email, role: role || 'DEVELOPER' },
    },
  });

  sendResponse({ res, statusCode: 201, message: 'User invited successfully', data: { user: newUser, tempPassword } });
}));

export default router;
