// ============================================
// Dashboards Module — Full CRUD + Widgets
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

// GET /dashboards
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const dashboards = await prisma.dashboard.findMany({
    where: { organizationId: user.organizationId },
    include: { _count: { select: { widgets: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendResponse({ res, data: dashboards });
}));

// POST /dashboards
router.post('/', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const dashboard = await prisma.dashboard.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      layout: req.body.layout,
      organizationId: user.organizationId,
      createdById: user.userId,
    },
  });
  sendResponse({ res, statusCode: 201, message: 'Dashboard created', data: dashboard });
}));

// GET /dashboards/:dashboardId
router.get('/:dashboardId', asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await prisma.dashboard.findUnique({
    where: { id: p(req.params.dashboardId) },
    include: { widgets: { orderBy: { createdAt: 'asc' } } },
  });
  if (!dashboard) { sendResponse({ res, statusCode: 404, message: 'Dashboard not found' }); return; }
  sendResponse({ res, data: dashboard });
}));

// PATCH /dashboards/:dashboardId
router.patch('/:dashboardId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.layout !== undefined) data.layout = req.body.layout;
  if (req.body.isDefault !== undefined) data.isDefault = req.body.isDefault;

  const dashboard = await prisma.dashboard.update({ where: { id: p(req.params.dashboardId) }, data });
  sendResponse({ res, message: 'Dashboard updated', data: dashboard });
}));

// DELETE /dashboards/:dashboardId
router.delete('/:dashboardId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.dashboard.delete({ where: { id: p(req.params.dashboardId) } });
  sendResponse({ res, message: 'Dashboard deleted' });
}));

// --- WIDGETS ---

// GET /dashboards/:dashboardId/widgets
router.get('/:dashboardId/widgets', asyncHandler(async (req: Request, res: Response) => {
  const widgets = await prisma.dashboardWidget.findMany({
    where: { dashboardId: p(req.params.dashboardId) },
    orderBy: { createdAt: 'asc' },
  });
  sendResponse({ res, data: widgets });
}));

// POST /dashboards/:dashboardId/widgets
router.post('/:dashboardId/widgets', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const widget = await prisma.dashboardWidget.create({
    data: {
      title: req.body.title,
      type: req.body.type,
      config: req.body.config,
      position: req.body.position,
      dataSource: req.body.dataSource,
      dashboardId: p(req.params.dashboardId),
    },
  });
  sendResponse({ res, statusCode: 201, message: 'Widget created', data: widget });
}));

// PATCH /dashboards/:dashboardId/widgets/:widgetId
router.patch('/:dashboardId/widgets/:widgetId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.title !== undefined) data.title = req.body.title;
  if (req.body.type !== undefined) data.type = req.body.type;
  if (req.body.config !== undefined) data.config = req.body.config;
  if (req.body.position !== undefined) data.position = req.body.position;
  if (req.body.dataSource !== undefined) data.dataSource = req.body.dataSource;

  const widget = await prisma.dashboardWidget.update({ where: { id: p(req.params.widgetId) }, data });
  sendResponse({ res, message: 'Widget updated', data: widget });
}));

// DELETE /dashboards/:dashboardId/widgets/:widgetId
router.delete('/:dashboardId/widgets/:widgetId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.dashboardWidget.delete({ where: { id: p(req.params.widgetId) } });
  sendResponse({ res, message: 'Widget deleted' });
}));

export default router;
