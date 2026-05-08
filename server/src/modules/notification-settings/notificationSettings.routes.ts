// ============================================
// Notification Settings Module
// ============================================

import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /notification-settings — Get my settings
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  let settings = await prisma.notificationSetting.findUnique({ where: { userId: user.userId } });
  if (!settings) {
    settings = await prisma.notificationSetting.create({ data: { userId: user.userId } });
  }
  sendResponse({ res, data: settings });
}));

// PATCH /notification-settings — Update my settings
router.patch('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data: any = {};
  const fields = [
    'emailNotifications', 'pushNotifications', 'taskAssigned', 'taskUpdated',
    'taskCompleted', 'commentAdded', 'mentionNotification', 'sprintUpdates',
    'projectUpdates', 'dailyDigest', 'weeklyReport',
  ];
  fields.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

  const settings = await prisma.notificationSetting.upsert({
    where: { userId: user.userId },
    update: data,
    create: { userId: user.userId, ...data },
  });
  sendResponse({ res, message: 'Settings updated', data: settings });
}));

export default router;
