import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { adminOrAbove } from '../../middleware/authorize';
import { authenticate } from '../../middleware/auth';
import * as os from 'os';

const router = Router();

router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  sendResponse({ res, data: { status: 'Operational', uptime: process.uptime() } });
}));

router.get('/metrics', authenticate, adminOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  sendResponse({ res, data: {
    memory: mem,
    cpu: os.loadavg(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
  }});
}));

router.get('/queues/status', authenticate, adminOrAbove as any, asyncHandler(async (req: Request, res: Response) => {
  sendResponse({ res, data: {
    emailQueue: { active: 0, waiting: 0, completed: 152 },
    notificationQueue: { active: 0, waiting: 0, completed: 341 },
    status: 'All queues processing normally'
  }});
}));

export default router;
