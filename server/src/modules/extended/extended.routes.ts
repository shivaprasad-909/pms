// ============================================
// Boards, Documents, Automation, Attachments, SavedViews
// All remaining API modules
// ============================================

import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';
import { managerOrAbove, adminOrAbove } from '../../middleware/authorize';
import { uploadSingle } from '../../middleware/upload';

// ─── BOARDS ────────────────

export const boardRoutes = Router();
boardRoutes.use(authenticate);

boardRoutes.get('/project/:projectId', asyncHandler(async (req: Request, res: Response) => {
  const boards = await prisma.board.findMany({
    where: { projectId: p(req.params.projectId) },
    include: { columns: { orderBy: { position: 'asc' }, include: { _count: { select: { tasks: true } } } } },
  });
  sendResponse({ res, data: boards });
}));

boardRoutes.post('/', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const board = await prisma.board.create({
    data: {
      name: req.body.name || 'Board',
      projectId: req.body.projectId,
      columns: {
        createMany: {
          data: req.body.columns || [
            { name: 'To Do', color: '#636E72', position: 0, taskStatus: 'TODO' },
            { name: 'In Progress', color: '#6C5CE7', position: 1, taskStatus: 'IN_PROGRESS' },
            { name: 'In Review', color: '#F39C12', position: 2, taskStatus: 'IN_REVIEW' },
            { name: 'Done', color: '#00B894', position: 3, taskStatus: 'DONE' },
          ],
        },
      },
    },
    include: { columns: { orderBy: { position: 'asc' } } },
  });
  sendResponse({ res, statusCode: 201, data: board });
}));

boardRoutes.patch('/columns/:columnId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const col = await prisma.boardColumn.update({ where: { id: p(req.params.columnId) }, data: req.body });
  sendResponse({ res, data: col });
}));

boardRoutes.post('/columns', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const col = await prisma.boardColumn.create({ data: req.body });
  sendResponse({ res, statusCode: 201, data: col });
}));

boardRoutes.delete('/columns/:columnId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.boardColumn.delete({ where: { id: p(req.params.columnId) } });
  sendResponse({ res, message: 'Column deleted' });
}));

// ─── TASK ATTACHMENTS ────────────────

export const attachmentRoutes = Router();
attachmentRoutes.use(authenticate);

attachmentRoutes.get('/task/:taskId', asyncHandler(async (req: Request, res: Response) => {
  const attachments = await prisma.taskAttachment.findMany({
    where: { taskId: p(req.params.taskId) },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendResponse({ res, data: attachments });
}));

attachmentRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const attachment = await prisma.taskAttachment.create({
    data: {
      fileName: req.body.fileName,
      fileUrl: req.body.fileUrl,
      fileType: req.body.fileType || 'application/octet-stream',
      fileSize: req.body.fileSize || 0,
      taskId: req.body.taskId,
      uploadedBy: user.userId,
    },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  });
  sendResponse({ res, statusCode: 201, data: attachment });
}));

// File upload with multer
attachmentRoutes.post('/upload', uploadSingle, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = (req as any).file;
  if (!file) { sendResponse({ res, statusCode: 400, message: 'No file uploaded' }); return; }
  const attachment = await prisma.taskAttachment.create({
    data: {
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      taskId: req.body.taskId,
      uploadedBy: user.userId,
    },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  });
  sendResponse({ res, statusCode: 201, data: attachment });
}));

attachmentRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.taskAttachment.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'Attachment deleted' });
}));

// ─── PROJECT APPROVAL WORKFLOW ────────────────

export const approvalRoutes = Router();
approvalRoutes.use(authenticate);

// Manager submits project for completion approval
approvalRoutes.post('/submit/:projectId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const project = await prisma.project.update({
    where: { id: p(req.params.projectId) },
    data: { status: 'PENDING_APPROVAL' as any },
  });
  // Notify founders
  const founders = await prisma.user.findMany({ where: { role: 'FOUNDER', organizationId: (req as any).user.organizationId } });
  for (const f of founders) {
    await prisma.notification.create({
      data: { userId: f.id, title: 'Project Approval Request', message: `Project "${project.name}" submitted for completion approval`, type: 'PROJECT_APPROVAL', link: `/projects/${project.id}` },
    });
  }
  const io = req.app.get('io');
  if (io) founders.forEach(f => io.to(f.id).emit('notification:created'));
  sendResponse({ res, message: 'Submitted for approval', data: project });
}));

// Founder approves project
approvalRoutes.post('/approve/:projectId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'FOUNDER') { sendResponse({ res, statusCode: 403, message: 'Only Founder can approve' }); return; }
  const project = await prisma.project.update({
    where: { id: p(req.params.projectId) },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
  sendResponse({ res, message: 'Project approved', data: project });
}));

// Founder rejects project
approvalRoutes.post('/reject/:projectId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'FOUNDER') { sendResponse({ res, statusCode: 403, message: 'Only Founder can reject' }); return; }
  const project = await prisma.project.update({
    where: { id: p(req.params.projectId) },
    data: { status: 'ACTIVE' },
  });
  sendResponse({ res, message: 'Project rejected, returned to active', data: project });
}));

// Get pending approvals
approvalRoutes.get('/pending', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const projects = await prisma.project.findMany({
    where: { organizationId: user.organizationId, status: 'PENDING_APPROVAL' as any },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { tasks: true } } },
  });
  sendResponse({ res, data: projects });
}));

// ─── SAVED VIEWS ────────────────

export const viewRoutes = Router();
viewRoutes.use(authenticate);

viewRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = { userId: user.userId };
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  const views = await prisma.savedView.findMany({ where, orderBy: { createdAt: 'desc' } });
  sendResponse({ res, data: views });
}));

viewRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const view = await prisma.savedView.create({
    data: { ...req.body, userId: user.userId },
  });
  sendResponse({ res, statusCode: 201, data: view });
}));

viewRoutes.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const view = await prisma.savedView.update({ where: { id: p(req.params.id) }, data: req.body });
  sendResponse({ res, data: view });
}));

viewRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.savedView.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'View deleted' });
}));

// ─── DOCUMENTS (Notion-style) ────────────────

export const documentRoutes = Router();
documentRoutes.use(authenticate);

documentRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = {};
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  else where.createdById = user.userId;
  if (req.query.parentId) where.parentId = req.query.parentId as string;
  else if (!req.query.all) where.parentId = null; // top-level only by default

  const pages = await prisma.documentPage.findMany({
    where, orderBy: { updatedAt: 'desc' },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      project: { select: { id: true, name: true } },
      _count: { select: { children: true, blocks: true } },
    },
  });
  sendResponse({ res, data: pages });
}));

documentRoutes.get('/:pageId', asyncHandler(async (req: Request, res: Response) => {
  const page = await prisma.documentPage.findUnique({
    where: { id: p(req.params.pageId) },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      project: { select: { id: true, name: true } },
      blocks: { orderBy: { position: 'asc' } },
      children: {
        select: { id: true, title: true, icon: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });
  if (!page) { sendResponse({ res, statusCode: 404, message: 'Page not found' }); return; }
  sendResponse({ res, data: page });
}));

documentRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const page = await prisma.documentPage.create({
    data: {
      title: req.body.title || 'Untitled',
      icon: req.body.icon,
      coverImage: req.body.coverImage,
      projectId: req.body.projectId,
      parentId: req.body.parentId,
      createdById: user.userId,
    },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
  });
  sendResponse({ res, statusCode: 201, data: page });
}));

documentRoutes.patch('/:pageId', asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.title !== undefined) data.title = req.body.title;
  if (req.body.icon !== undefined) data.icon = req.body.icon;
  if (req.body.coverImage !== undefined) data.coverImage = req.body.coverImage;
  if (req.body.isPublished !== undefined) data.isPublished = req.body.isPublished;

  const page = await prisma.documentPage.update({ where: { id: p(req.params.pageId) }, data });
  sendResponse({ res, data: page });
}));

documentRoutes.delete('/:pageId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.documentPage.delete({ where: { id: p(req.params.pageId) } });
  sendResponse({ res, message: 'Page deleted' });
}));

// Document Blocks
documentRoutes.post('/:pageId/blocks', asyncHandler(async (req: Request, res: Response) => {
  const block = await prisma.documentBlock.create({
    data: {
      type: req.body.type || 'PARAGRAPH',
      content: req.body.content || {},
      position: req.body.position || 0,
      pageId: p(req.params.pageId),
    },
  });
  sendResponse({ res, statusCode: 201, data: block });
}));

documentRoutes.patch('/blocks/:blockId', asyncHandler(async (req: Request, res: Response) => {
  const block = await prisma.documentBlock.update({
    where: { id: p(req.params.blockId) }, data: req.body,
  });
  sendResponse({ res, data: block });
}));

documentRoutes.delete('/blocks/:blockId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.documentBlock.delete({ where: { id: p(req.params.blockId) } });
  sendResponse({ res, message: 'Block deleted' });
}));

// Batch update blocks (reorder/bulk edit)
documentRoutes.put('/:pageId/blocks', asyncHandler(async (req: Request, res: Response) => {
  const pageId = p(req.params.pageId);
  const blocks = req.body.blocks || [];

  // Delete existing and re-create (simple approach)
  await prisma.documentBlock.deleteMany({ where: { pageId } });
  if (blocks.length > 0) {
    await prisma.documentBlock.createMany({
      data: blocks.map((b: any, i: number) => ({
        type: b.type || 'PARAGRAPH', content: b.content || {}, position: i, pageId,
      })),
    });
  }

  const updated = await prisma.documentBlock.findMany({ where: { pageId }, orderBy: { position: 'asc' } });
  sendResponse({ res, data: updated });
}));

// ─── AUTOMATION RULES ────────────────

export const automationRoutes = Router();
automationRoutes.use(authenticate);
automationRoutes.use(adminOrAbove as any);

automationRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = { organizationId: user.organizationId };
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

  const rules = await prisma.automationRule.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { executions: true } },
    },
  });
  sendResponse({ res, data: rules });
}));

automationRoutes.get('/:ruleId', asyncHandler(async (req: Request, res: Response) => {
  const rule = await prisma.automationRule.findUnique({
    where: { id: p(req.params.ruleId) },
    include: {
      project: { select: { id: true, name: true } },
      executions: { take: 20, orderBy: { executedAt: 'desc' } },
    },
  });
  sendResponse({ res, data: rule });
}));

automationRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const rule = await prisma.automationRule.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      trigger: req.body.trigger,
      triggerConfig: req.body.triggerConfig,
      conditions: req.body.conditions,
      actions: req.body.actions,
      projectId: req.body.projectId,
      organizationId: user.organizationId,
    },
  });
  sendResponse({ res, statusCode: 201, data: rule });
}));

automationRoutes.patch('/:ruleId', asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.isActive !== undefined) data.isActive = req.body.isActive;
  if (req.body.trigger !== undefined) data.trigger = req.body.trigger;
  if (req.body.triggerConfig !== undefined) data.triggerConfig = req.body.triggerConfig;
  if (req.body.conditions !== undefined) data.conditions = req.body.conditions;
  if (req.body.actions !== undefined) data.actions = req.body.actions;

  const rule = await prisma.automationRule.update({ where: { id: p(req.params.ruleId) }, data });
  sendResponse({ res, data: rule });
}));

automationRoutes.delete('/:ruleId', asyncHandler(async (req: Request, res: Response) => {
  await prisma.automationRule.delete({ where: { id: p(req.params.ruleId) } });
  sendResponse({ res, message: 'Automation rule deleted' });
}));

// Execution log
automationRoutes.get('/:ruleId/executions', asyncHandler(async (req: Request, res: Response) => {
  const executions = await prisma.automationExecution.findMany({
    where: { ruleId: p(req.params.ruleId) },
    orderBy: { executedAt: 'desc' }, take: 50,
  });
  sendResponse({ res, data: executions });
}));

// ─── PERMISSIONS (Granular RBAC) ────────────────

export const permissionRoutes = Router();
permissionRoutes.use(authenticate);
permissionRoutes.use(adminOrAbove as any);

permissionRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({
    orderBy: { category: 'asc' },
    include: { rolePermissions: true },
  });
  sendResponse({ res, data: permissions });
}));

permissionRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const perm = await prisma.permission.create({
    data: { name: req.body.name, description: req.body.description, category: req.body.category },
  });
  sendResponse({ res, statusCode: 201, data: perm });
}));

permissionRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.permission.delete({ where: { id: p(req.params.id) } });
  sendResponse({ res, message: 'Permission deleted' });
}));

// Role-Permission matrix
permissionRoutes.get('/matrix', asyncHandler(async (req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({ orderBy: { category: 'asc' } });
  const rolePerms = await prisma.rolePermission.findMany();
  const roles = ['FOUNDER', 'ADMIN', 'MANAGER', 'DEVELOPER'];
  const matrix = permissions.map(p => ({
    ...p,
    roles: Object.fromEntries(roles.map(r => [r, rolePerms.some(rp => rp.permissionId === p.id && rp.role === r as any)])),
  }));
  sendResponse({ res, data: matrix });
}));

permissionRoutes.post('/assign', asyncHandler(async (req: Request, res: Response) => {
  const { role, permissionId } = req.body;
  const rp = await prisma.rolePermission.create({ data: { role, permissionId } });
  sendResponse({ res, statusCode: 201, data: rp });
}));

permissionRoutes.delete('/revoke', asyncHandler(async (req: Request, res: Response) => {
  const { role, permissionId } = req.body;
  await prisma.rolePermission.deleteMany({ where: { role, permissionId } });
  sendResponse({ res, message: 'Permission revoked' });
}));

// CSV export endpoint for activity logs
export const exportRoutes = Router();
exportRoutes.use(authenticate);

exportRoutes.get('/activity-csv', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where: any = {};
  if (req.query.projectId) where.projectId = req.query.projectId as string;
  if (user.role !== 'FOUNDER' && user.role !== 'ADMIN') where.userId = user.userId;

  const logs = await prisma.activityLog.findMany({
    where, orderBy: { createdAt: 'desc' }, take: 1000,
    include: { user: { select: { firstName: true, lastName: true, email: true } }, project: { select: { name: true } } },
  });

  const csv = ['Date,User,Email,Action,Entity,Project']
    .concat(logs.map(l =>
      `${l.createdAt.toISOString()},${l.user.firstName} ${l.user.lastName},${l.user.email},${l.action},${l.entityType},${l.project?.name || ''}`
    )).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=activity_log.csv');
  res.send(csv);
}));

exportRoutes.get('/tasks-csv', asyncHandler(async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.projectId) where.projectId = req.query.projectId as string;

  const tasks = await prisma.task.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { project: { select: { name: true } }, assignments: { include: { user: { select: { firstName: true, lastName: true } } } } },
  });

  const csv = ['Title,Status,Priority,Project,Assignees,Due Date,Story Points']
    .concat(tasks.map(t =>
      `"${t.title}",${t.status},${t.priority},${t.project.name},"${t.assignments.map(a => `${a.user.firstName} ${a.user.lastName}`).join('; ')}",${t.dueDate?.toISOString() || ''},${t.storyPoints || ''}`
    )).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
  res.send(csv);
}));

exportRoutes.get('/time-logs-csv', asyncHandler(async (req: Request, res: Response) => {
  const logs = await prisma.timeLog.findMany({
    orderBy: { logDate: 'desc' }, take: 1000,
    include: { user: { select: { firstName: true, lastName: true } }, task: { select: { title: true }, include: { project: { select: { name: true } } } } },
  });

  const csv = ['Date,User,Task,Project,Hours,Description']
    .concat(logs.map(l =>
      `${l.logDate.toISOString()},${l.user.firstName} ${l.user.lastName},"${l.task.title}",${l.task.project.name},${l.hours},"${l.description || ''}"`
    )).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=time_logs.csv');
  res.send(csv);
}));

exportRoutes.get('/report-pdf', asyncHandler(async (req: Request, res: Response) => {
  const PDFDocument = (await import('pdfkit')).default;
  const user = (req as any).user;

  const [projects, taskStats] = await Promise.all([
    prisma.project.findMany({ where: { organizationId: user.organizationId }, include: { _count: { select: { tasks: true } } } }),
    prisma.task.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=project_report.pdf');
  doc.pipe(res);

  doc.fontSize(20).text('Project Management Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(14).text('Task Summary');
  doc.moveDown(0.5);
  taskStats.forEach(s => {
    doc.fontSize(11).text(`  ${s.status}: ${s._count.status} tasks`);
  });
  doc.moveDown();

  doc.fontSize(14).text('Projects');
  doc.moveDown(0.5);
  projects.forEach(p => {
    doc.fontSize(11).text(`  ${p.name} — ${p.status} (${p._count.tasks} tasks)`);
  });

  doc.end();
}));
