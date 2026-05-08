"use strict";
// ============================================
// Boards Module — Full CRUD + Columns + Groups
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ─── BOARDS ────────────────
// GET /boards/project/:projectId
router.get('/project/:projectId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const boards = await database_1.default.board.findMany({
        where: { projectId: (0, params_1.p)(req.params.projectId) },
        include: {
            columns: { orderBy: { position: 'asc' }, include: { _count: { select: { tasks: true } } } },
            groups: { orderBy: { position: 'asc' } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, data: boards });
}));
// POST /boards
router.post('/', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const board = await database_1.default.board.create({
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
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: board });
}));
// GET /boards/:boardId
router.get('/:boardId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const board = await database_1.default.board.findUnique({
        where: { id: (0, params_1.p)(req.params.boardId) },
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
    if (!board) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Board not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: board });
}));
// PATCH /boards/:boardId
router.patch('/:boardId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    const board = await database_1.default.board.update({ where: { id: (0, params_1.p)(req.params.boardId) }, data });
    (0, apiResponse_1.sendResponse)({ res, message: 'Board updated', data: board });
}));
// DELETE /boards/:boardId
router.delete('/:boardId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.board.delete({ where: { id: (0, params_1.p)(req.params.boardId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Board deleted' });
}));
// ─── COLUMNS ────────────────
router.post('/columns', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const col = await database_1.default.boardColumn.create({ data: req.body });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: col });
}));
router.patch('/columns/:columnId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const col = await database_1.default.boardColumn.update({ where: { id: (0, params_1.p)(req.params.columnId) }, data: req.body });
    (0, apiResponse_1.sendResponse)({ res, data: col });
}));
router.delete('/columns/:columnId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.boardColumn.delete({ where: { id: (0, params_1.p)(req.params.columnId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Column deleted' });
}));
// ─── GROUPS ────────────────
router.get('/:boardId/groups', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const groups = await database_1.default.boardGroup.findMany({
        where: { boardId: (0, params_1.p)(req.params.boardId) },
        orderBy: { position: 'asc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: groups });
}));
router.post('/:boardId/groups', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const group = await database_1.default.boardGroup.create({
        data: {
            name: req.body.name,
            color: req.body.color || '#636E72',
            position: req.body.position || 0,
            boardId: (0, params_1.p)(req.params.boardId),
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: group });
}));
router.patch('/groups/:groupId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.color !== undefined)
        data.color = req.body.color;
    if (req.body.position !== undefined)
        data.position = req.body.position;
    if (req.body.isCollapsed !== undefined)
        data.isCollapsed = req.body.isCollapsed;
    const group = await database_1.default.boardGroup.update({ where: { id: (0, params_1.p)(req.params.groupId) }, data });
    (0, apiResponse_1.sendResponse)({ res, data: group });
}));
router.delete('/groups/:groupId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.boardGroup.delete({ where: { id: (0, params_1.p)(req.params.groupId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Group deleted' });
}));
exports.default = router;
//# sourceMappingURL=board.routes.js.map