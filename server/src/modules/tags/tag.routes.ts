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
  const user = (req as any).user;
  const tags = await prisma.tag.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: 'desc' }
  });
  sendResponse({ res, data: tags });
}));

router.post('/', managerOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const tag = await prisma.tag.create({
    data: {
      name: req.body.name,
      color: req.body.color,
      organizationId: user.organizationId
    }
  });
  sendResponse({ res, statusCode: 201, data: tag });
}));

router.patch('/:id', managerOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  const tag = await prisma.tag.update({
    where: { id: p(req.params.id) },
    data: req.body
  });
  sendResponse({ res, data: tag });
}));

router.delete('/:id', managerOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  await prisma.tag.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'Tag deleted' });
}));

export default router;
