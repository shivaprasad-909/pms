import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';
import { managerOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  
  const fields = await prisma.customField.findMany({
    where,
    orderBy: { createdAt: 'asc' }
  });
  sendResponse({ res, data: fields });
}));

router.post('/', managerOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  const field = await prisma.customField.create({
    data: {
      name: req.body.name,
      type: req.body.type || 'TEXT',
      options: req.body.options,
      projectId: req.body.projectId
    }
  });
  sendResponse({ res, statusCode: 201, data: field });
}));

router.patch('/:id', managerOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  const field = await prisma.customField.update({
    where: { id: p(req.params.id) },
    data: req.body
  });
  sendResponse({ res, data: field });
}));

router.delete('/:id', managerOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  await prisma.customField.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'Custom field deleted' });
}));

export default router;
