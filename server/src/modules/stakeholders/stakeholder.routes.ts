// ============================================
// Stakeholders Module — Full CRUD
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

// GET /projects/:projectId/stakeholders
router.get('/:projectId/stakeholders', asyncHandler(async (req: Request, res: Response) => {
  const stakeholders = await prisma.stakeholder.findMany({
    where: { projectId: p(req.params.projectId) },
    orderBy: { createdAt: 'desc' },
  });
  sendResponse({ res, data: stakeholders });
}));

// POST /projects/:projectId/stakeholders
router.post('/:projectId/stakeholders', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const stakeholder = await prisma.stakeholder.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      role: req.body.role,
      influence: req.body.influence || 'MEDIUM',
      notes: req.body.notes,
      projectId: p(req.params.projectId),
    },
  });
  sendResponse({ res, statusCode: 201, message: 'Stakeholder added', data: stakeholder });
}));

// PATCH /projects/:projectId/stakeholders/:stakeholderId
router.patch('/:projectId/stakeholders/:stakeholderId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.email !== undefined) data.email = req.body.email;
  if (req.body.phone !== undefined) data.phone = req.body.phone;
  if (req.body.company !== undefined) data.company = req.body.company;
  if (req.body.role !== undefined) data.role = req.body.role;
  if (req.body.influence !== undefined) data.influence = req.body.influence;
  if (req.body.notes !== undefined) data.notes = req.body.notes;

  const stakeholder = await prisma.stakeholder.update({
    where: { id: p(req.params.stakeholderId) },
    data,
  });
  sendResponse({ res, message: 'Stakeholder updated', data: stakeholder });
}));

// DELETE /projects/:projectId/stakeholders/:stakeholderId
router.delete('/:projectId/stakeholders/:stakeholderId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.stakeholder.delete({ where: { id: p(req.params.stakeholderId) } });
  sendResponse({ res, message: 'Stakeholder removed' });
}));

export default router;
