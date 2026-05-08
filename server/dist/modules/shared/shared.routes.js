"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoutes = exports.chatRoutes = exports.notificationRoutes = exports.activityLogRoutes = exports.timeLogRoutes = void 0;
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const auth_1 = require("../../middleware/auth");
// ─── TIME LOGS ────────────────
exports.timeLogRoutes = (0, express_1.Router)();
exports.timeLogRoutes.use(auth_1.authenticate);
exports.timeLogRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = {};
    if (user.role === 'DEVELOPER')
        where.userId = user.userId;
    if (req.query.taskId)
        where.taskId = req.query.taskId;
    if (req.query.userId)
        where.userId = req.query.userId;
    if (req.query.from)
        where.logDate = { ...where.logDate, gte: new Date(req.query.from) };
    if (req.query.to)
        where.logDate = { ...where.logDate, lte: new Date(req.query.to) };
    const logs = await database_1.default.timeLog.findMany({
        where, orderBy: { logDate: 'desc' }, take: 100,
        include: {
            task: { select: { id: true, title: true, project: { select: { id: true, name: true } } } },
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, data: logs });
}));
exports.timeLogRoutes.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const log = await database_1.default.timeLog.create({
        data: {
            hours: req.body.hours,
            description: req.body.description,
            logDate: new Date(req.body.logDate || new Date()),
            startTime: req.body.startTime ? new Date(req.body.startTime) : null,
            endTime: req.body.endTime ? new Date(req.body.endTime) : null,
            taskId: req.body.taskId,
            userId: user.userId,
        },
        include: {
            task: { select: { id: true, title: true } },
            user: { select: { id: true, firstName: true, lastName: true } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: log });
}));
exports.timeLogRoutes.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const log = await database_1.default.timeLog.update({ where: { id: (0, params_1.p)(req.params.id) }, data: req.body });
    (0, apiResponse_1.sendResponse)({ res, data: log });
}));
exports.timeLogRoutes.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.timeLog.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Time log deleted' });
}));
// ─── ACTIVITY LOGS ────────────────
exports.activityLogRoutes = (0, express_1.Router)();
exports.activityLogRoutes.use(auth_1.authenticate);
exports.activityLogRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = {};
    if (user.role === 'DEVELOPER') {
        where.userId = user.userId;
    }
    else if (user.role === 'MANAGER') {
        const myProjects = await database_1.default.projectMember.findMany({ where: { userId: user.userId, role: 'MANAGER' }, select: { projectId: true } });
        where.projectId = { in: myProjects.map((mp) => mp.projectId) };
    }
    else {
        where.organizationId = user.organizationId;
    }
    if (req.query.userId)
        where.userId = req.query.userId;
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    if (req.query.action)
        where.action = req.query.action;
    if (req.query.entityType)
        where.entityType = req.query.entityType;
    if (req.query.from)
        where.createdAt = { ...where.createdAt, gte: new Date(req.query.from) };
    if (req.query.to)
        where.createdAt = { ...where.createdAt, lte: new Date(req.query.to) };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const [logs, total] = await Promise.all([
        database_1.default.activityLog.findMany({
            where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
                project: { select: { id: true, name: true } },
            },
        }),
        database_1.default.activityLog.count({ where }),
    ]);
    (0, apiResponse_1.sendResponse)({ res, data: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));
// ─── NOTIFICATIONS ────────────────
exports.notificationRoutes = (0, express_1.Router)();
exports.notificationRoutes.use(auth_1.authenticate);
exports.notificationRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const notifications = await database_1.default.notification.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' }, take: 50,
    });
    const unreadCount = await database_1.default.notification.count({ where: { userId: user.userId, isRead: false } });
    (0, apiResponse_1.sendResponse)({ res, data: { notifications, unreadCount } });
}));
exports.notificationRoutes.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notif = await database_1.default.notification.update({
        where: { id: (0, params_1.p)(req.params.id) }, data: { isRead: req.body.isRead ?? true },
    });
    (0, apiResponse_1.sendResponse)({ res, data: notif });
}));
exports.notificationRoutes.post('/mark-all-read', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    await database_1.default.notification.updateMany({ where: { userId: user.userId, isRead: false }, data: { isRead: true } });
    (0, apiResponse_1.sendResponse)({ res, message: 'All marked as read' });
}));
// ─── CHAT / CHANNELS ────────────────
exports.chatRoutes = (0, express_1.Router)();
exports.chatRoutes.use(auth_1.authenticate);
exports.chatRoutes.get('/channels', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const channels = await database_1.default.chatChannel.findMany({
        where: { organizationId: user.organizationId, members: { some: { userId: user.userId } } },
        include: {
            _count: { select: { members: true, messages: true } },
            project: { select: { id: true, name: true } },
            messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true, user: { select: { firstName: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: channels });
}));
exports.chatRoutes.post('/channels', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const channel = await database_1.default.chatChannel.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            type: req.body.type || 'TEAM',
            organizationId: user.organizationId,
            projectId: req.body.projectId,
            members: { create: { userId: user.userId } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: channel });
}));
exports.chatRoutes.get('/channels/:channelId/messages', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await database_1.default.channelMessage.findMany({
        where: { channelId: (0, params_1.p)(req.params.channelId) },
        skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, data: messages.reverse() });
}));
exports.chatRoutes.post('/channels/:channelId/messages', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const msg = await database_1.default.channelMessage.create({
        data: {
            content: req.body.content,
            channelId: (0, params_1.p)(req.params.channelId),
            userId: user.userId,
            mentions: req.body.mentions,
            parentId: req.body.parentId,
        },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    // Emit real-time message event
    const io = req.app.get('io');
    if (io)
        io.to(`channel:${req.params.channelId}`).emit('message:created', msg);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: msg });
}));
exports.chatRoutes.post('/channels/:channelId/members', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const member = await database_1.default.channelMember.create({
        data: { channelId: (0, params_1.p)(req.params.channelId), userId: req.body.userId },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: member });
}));
// ─── SEARCH ────────────────
exports.searchRoutes = (0, express_1.Router)();
exports.searchRoutes.use(auth_1.authenticate);
exports.searchRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const q = req.query.q || '';
    const types = (req.query.types || 'tasks,projects,users').split(',');
    if (!q || q.length < 2) {
        (0, apiResponse_1.sendResponse)({ res, data: { tasks: [], projects: [], users: [] } });
        return;
    }
    const results = {};
    if (types.includes('tasks')) {
        const taskWhere = {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ],
        };
        if (user.role === 'DEVELOPER')
            taskWhere.assignments = { some: { userId: user.userId } };
        else if (user.role === 'MANAGER')
            taskWhere.project = { members: { some: { userId: user.userId } } };
        else
            taskWhere.project = { organizationId: user.organizationId };
        results.tasks = await database_1.default.task.findMany({
            where: taskWhere, take: 10,
            select: { id: true, title: true, status: true, priority: true, project: { select: { id: true, name: true } } },
        });
    }
    if (types.includes('projects')) {
        const projWhere = {
            organizationId: user.organizationId,
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ],
        };
        if (user.role === 'MANAGER' || user.role === 'DEVELOPER') {
            projWhere.members = { some: { userId: user.userId } };
        }
        results.projects = await database_1.default.project.findMany({
            where: projWhere, take: 10,
            select: { id: true, name: true, status: true, slug: true },
        });
    }
    if (types.includes('users') && ['FOUNDER', 'ADMIN', 'MANAGER'].includes(user.role)) {
        results.users = await database_1.default.user.findMany({
            where: {
                organizationId: user.organizationId,
                OR: [
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            take: 10,
            select: { id: true, firstName: true, lastName: true, email: true, role: true, avatar: true },
        });
    }
    (0, apiResponse_1.sendResponse)({ res, data: results });
}));
//# sourceMappingURL=shared.routes.js.map