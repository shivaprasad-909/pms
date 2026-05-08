// ============================================
// Webhooks Module — Full CRUD + Ping
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
router.use(adminOrAbove as any);

// GET /webhooks
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const webhooks = await prisma.webhook.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: 'desc' },
  });
  sendResponse({ res, data: webhooks });
}));

// POST /webhooks
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const webhook = await prisma.webhook.create({
    data: {
      name: req.body.name,
      url: req.body.url,
      secret: req.body.secret,
      events: req.body.events || [],
      organizationId: user.organizationId,
    },
  });
  sendResponse({ res, statusCode: 201, message: 'Webhook created', data: webhook });
}));

// GET /webhooks/:webhookId
router.get('/:webhookId', asyncHandler(async (req: Request, res: Response) => {
  const webhook = await prisma.webhook.findUnique({ where: { id: p(req.params.webhookId) } });
  if (!webhook) { sendResponse({ res, statusCode: 404, message: 'Webhook not found' }); return; }
  sendResponse({ res, data: webhook });
}));

// PATCH /webhooks/:webhookId
router.patch('/:webhookId', asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.url !== undefined) data.url = req.body.url;
  if (req.body.secret !== undefined) data.secret = req.body.secret;
  if (req.body.events !== undefined) data.events = req.body.events;
  if (req.body.isActive !== undefined) data.isActive = req.body.isActive;

  const webhook = await prisma.webhook.update({ where: { id: p(req.params.webhookId) }, data });
  sendResponse({ res, message: 'Webhook updated', data: webhook });
}));

// DELETE /webhooks/:webhookId
router.delete('/:webhookId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.webhook.delete({ where: { id: p(req.params.webhookId) } });
  sendResponse({ res, message: 'Webhook deleted' });
}));

// POST /webhooks/:webhookId/ping
router.post('/:webhookId/ping', asyncHandler(async (req: Request, res: Response) => {
  const webhook = await prisma.webhook.findUnique({ where: { id: p(req.params.webhookId) } });
  if (!webhook) { sendResponse({ res, statusCode: 404, message: 'Webhook not found' }); return; }

  let status = 0;
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(webhook.secret ? { 'X-Webhook-Secret': webhook.secret } : {}) },
      body: JSON.stringify({ event: 'ping', timestamp: new Date().toISOString() }),
    });
    status = response.status;
  } catch {
    status = 0;
  }

  await prisma.webhook.update({
    where: { id: webhook.id },
    data: { lastPingedAt: new Date(), lastStatus: status },
  });

  sendResponse({ res, message: status >= 200 && status < 300 ? 'Ping successful' : `Ping failed with status ${status}`, data: { status } });
}));

export default router;
