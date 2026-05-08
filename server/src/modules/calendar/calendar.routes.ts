import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/events', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = { organizationId: user.organizationId };
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  if (req.query.userId) where.userId = req.query.userId as string;
  
  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: { user: { select: { id: true, firstName: true, lastName: true } } }
  });
  sendResponse({ res, data: events });
}));

router.post('/events', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const event = await prisma.calendarEvent.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
      isAllDay: req.body.isAllDay || false,
      location: req.body.location,
      userId: user.userId,
      projectId: req.body.projectId,
      organizationId: user.organizationId
    }
  });
  sendResponse({ res, statusCode: 201, data: event });
}));

router.patch('/events/:id', asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.calendarEvent.update({
    where: { id: p(req.params.id) },
    data: req.body
  });
  sendResponse({ res, data: event });
}));

router.delete('/events/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.calendarEvent.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'Event deleted' });
}));

export default router;
