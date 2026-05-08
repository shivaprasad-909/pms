"use strict";
// ============================================
// Chat Module — Complete CRUD for Channels,
// Messages, and Members
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
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ─── CHANNELS ────────────────
// GET /chat/channels
router.get('/channels', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const channels = await database_1.default.chatChannel.findMany({
        where: { organizationId: user.organizationId, members: { some: { userId: user.userId } } },
        include: {
            _count: { select: { members: true, messages: true } },
            project: { select: { id: true, name: true } },
            messages: {
                take: 1, orderBy: { createdAt: 'desc' },
                select: { content: true, createdAt: true, user: { select: { firstName: true } } },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: channels });
}));
// POST /chat/channels
router.post('/channels', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
        include: { _count: { select: { members: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: channel });
}));
// GET /chat/channels/:channelId
router.get('/channels/:channelId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const channel = await database_1.default.chatChannel.findUnique({
        where: { id: (0, params_1.p)(req.params.channelId) },
        include: {
            _count: { select: { members: true, messages: true } },
            project: { select: { id: true, name: true } },
            members: {
                include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
            },
        },
    });
    if (!channel) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Channel not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: channel });
}));
// PATCH /chat/channels/:channelId
router.patch('/channels/:channelId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.description !== undefined)
        data.description = req.body.description;
    const channel = await database_1.default.chatChannel.update({ where: { id: (0, params_1.p)(req.params.channelId) }, data });
    (0, apiResponse_1.sendResponse)({ res, message: 'Channel updated', data: channel });
}));
// DELETE /chat/channels/:channelId
router.delete('/channels/:channelId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.chatChannel.delete({ where: { id: (0, params_1.p)(req.params.channelId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Channel deleted' });
}));
// ─── MESSAGES ────────────────
// GET /chat/channels/:channelId/messages
router.get('/channels/:channelId/messages', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const [messages, total] = await Promise.all([
        database_1.default.channelMessage.findMany({
            where: { channelId: (0, params_1.p)(req.params.channelId) },
            skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
        }),
        database_1.default.channelMessage.count({ where: { channelId: (0, params_1.p)(req.params.channelId) } }),
    ]);
    (0, apiResponse_1.sendResponse)({ res, data: messages.reverse(), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));
// POST /chat/channels/:channelId/messages
router.post('/channels/:channelId/messages', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
    // Update channel timestamp
    await database_1.default.chatChannel.update({ where: { id: (0, params_1.p)(req.params.channelId) }, data: { updatedAt: new Date() } });
    // Emit real-time event
    const io = req.app.get('io');
    if (io)
        io.to(`channel:${req.params.channelId}`).emit('message:created', msg);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: msg });
}));
// PATCH /chat/channels/:channelId/messages/:messageId
router.patch('/channels/:channelId/messages/:messageId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const msg = await database_1.default.channelMessage.update({
        where: { id: (0, params_1.p)(req.params.messageId) },
        data: { content: req.body.content },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    const io = req.app.get('io');
    if (io)
        io.to(`channel:${req.params.channelId}`).emit('message:updated', msg);
    (0, apiResponse_1.sendResponse)({ res, message: 'Message updated', data: msg });
}));
// DELETE /chat/channels/:channelId/messages/:messageId
router.delete('/channels/:channelId/messages/:messageId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.channelMessage.delete({ where: { id: (0, params_1.p)(req.params.messageId) } });
    const io = req.app.get('io');
    if (io)
        io.to(`channel:${req.params.channelId}`).emit('message:deleted', { id: (0, params_1.p)(req.params.messageId) });
    (0, apiResponse_1.sendResponse)({ res, message: 'Message deleted' });
}));
// ─── CHANNEL MEMBERS ────────────────
// GET /chat/channels/:channelId/members
router.get('/channels/:channelId/members', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const members = await database_1.default.channelMember.findMany({
        where: { channelId: (0, params_1.p)(req.params.channelId) },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, data: members });
}));
// POST /chat/channels/:channelId/members
router.post('/channels/:channelId/members', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const member = await database_1.default.channelMember.create({
        data: { channelId: (0, params_1.p)(req.params.channelId), userId: req.body.userId },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: member });
}));
// DELETE /chat/channels/:channelId/members/:userId
router.delete('/channels/:channelId/members/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.channelMember.deleteMany({
        where: { channelId: (0, params_1.p)(req.params.channelId), userId: (0, params_1.p)(req.params.userId) },
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Member removed from channel' });
}));
exports.default = router;
//# sourceMappingURL=chat.routes.js.map