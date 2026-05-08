// ============================================
// Boards Module — Full CRUD + Columns + Groups
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

// ─── BOARDS ────────────────

// GET /boards/project/:projectId
router.get('/project/:projectId', asyncHandler(async (req: Request, res: Response) => {
  const boards = await prisma.board.findMany({
    where: { projectId: p(req.params.projectId) },
    include: {
      columns: { orderBy: { position: 'asc' }, include: { _count: { select: { tasks: true } } } },
      groups: { orderBy: { position: 'asc' } },
    },
  });
  sendResponse({ res, data: boards });
}));

// POST /boards
router.post('/', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
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

// GET /boards/:boardId
router.get('/:boardId', asyncHandler(async (req: Request, res: Response) => {
  const board = await prisma.board.findUnique({
    where: { id: p(req.params.boardId) },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { position: 'asc' },
            include: {
              assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
              _count: { select: { comments: true, subtasks: true, attachments: true } },
            },
          },
        },
      },
      groups: { orderBy: { position: 'asc' } },
      project: { select: { id: true, name: true } },
    },
  });
  if (!board) { sendResponse({ res, statusCode: 404, message: 'Board not found' }); return; }
  sendResponse({ res, data: board });
}));

// PATCH /boards/:boardId
router.patch('/:boardId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  const board = await prisma.board.update({ where: { id: p(req.params.boardId) }, data });
  sendResponse({ res, message: 'Board updated', data: board });
}));

// DELETE /boards/:boardId
router.delete('/:boardId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.board.delete({ where: { id: p(req.params.boardId) } });
  sendResponse({ res, message: 'Board deleted' });
}));

// ─── COLUMNS ────────────────

router.post('/columns', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const col = await prisma.boardColumn.create({ data: req.body });
  sendResponse({ res, statusCode: 201, data: col });
}));

router.patch('/columns/:columnId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const col = await prisma.boardColumn.update({ where: { id: p(req.params.columnId) }, data: req.body });
  sendResponse({ res, data: col });
}));

router.delete('/columns/:columnId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.boardColumn.delete({ where: { id: p(req.params.columnId) } });
  sendResponse({ res, message: 'Column deleted' });
}));

// ─── GROUPS ────────────────

router.get('/:boardId/groups', asyncHandler(async (req: Request, res: Response) => {
  const groups = await prisma.boardGroup.findMany({
    where: { boardId: p(req.params.boardId) },
    orderBy: { position: 'asc' },
  });
  sendResponse({ res, data: groups });
}));

router.post('/:boardId/groups', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const group = await prisma.boardGroup.create({
    data: {
      name: req.body.name,
      color: req.body.color || '#636E72',
      position: req.body.position || 0,
      boardId: p(req.params.boardId),
    },
  });
  sendResponse({ res, statusCode: 201, data: group });
}));

router.patch('/groups/:groupId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.color !== undefined) data.color = req.body.color;
  if (req.body.position !== undefined) data.position = req.body.position;
  if (req.body.isCollapsed !== undefined) data.isCollapsed = req.body.isCollapsed;

  const group = await prisma.boardGroup.update({ where: { id: p(req.params.groupId) }, data });
  sendResponse({ res, data: group });
}));

router.delete('/groups/:groupId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  await prisma.boardGroup.delete({ where: { id: p(req.params.groupId) } });
  sendResponse({ res, message: 'Group deleted' });
}));

export default router;
