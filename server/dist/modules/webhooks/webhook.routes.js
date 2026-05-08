"use strict";
// ============================================
// Webhooks Module — Full CRUD + Ping
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
router.use(authorize_1.adminOrAbove);
// GET /webhooks
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const webhooks = await database_1.default.webhook.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: webhooks });
}));
// POST /webhooks
router.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const webhook = await database_1.default.webhook.create({
        data: {
            name: req.body.name,
            url: req.body.url,
            secret: req.body.secret,
            events: req.body.events || [],
            organizationId: user.organizationId,
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Webhook created', data: webhook });
}));
// GET /webhooks/:webhookId
router.get('/:webhookId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const webhook = await database_1.default.webhook.findUnique({ where: { id: (0, params_1.p)(req.params.webhookId) } });
    if (!webhook) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Webhook not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: webhook });
}));
// PATCH /webhooks/:webhookId
router.patch('/:webhookId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.url !== undefined)
        data.url = req.body.url;
    if (req.body.secret !== undefined)
        data.secret = req.body.secret;
    if (req.body.events !== undefined)
        data.events = req.body.events;
    if (req.body.isActive !== undefined)
        data.isActive = req.body.isActive;
    const webhook = await database_1.default.webhook.update({ where: { id: (0, params_1.p)(req.params.webhookId) }, data });
    (0, apiResponse_1.sendResponse)({ res, message: 'Webhook updated', data: webhook });
}));
// DELETE /webhooks/:webhookId
router.delete('/:webhookId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.webhook.delete({ where: { id: (0, params_1.p)(req.params.webhookId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Webhook deleted' });
}));
// POST /webhooks/:webhookId/ping
router.post('/:webhookId/ping', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const webhook = await database_1.default.webhook.findUnique({ where: { id: (0, params_1.p)(req.params.webhookId) } });
    if (!webhook) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Webhook not found' });
        return;
    }
    let status = 0;
    try {
        const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(webhook.secret ? { 'X-Webhook-Secret': webhook.secret } : {}) },
            body: JSON.stringify({ event: 'ping', timestamp: new Date().toISOString() }),
        });
        status = response.status;
    }
    catch {
        status = 0;
    }
    await database_1.default.webhook.update({
        where: { id: webhook.id },
        data: { lastPingedAt: new Date(), lastStatus: status },
    });
    (0, apiResponse_1.sendResponse)({ res, message: status >= 200 && status < 300 ? 'Ping successful' : `Ping failed with status ${status}`, data: { status } });
}));
exports.default = router;
//# sourceMappingURL=webhook.routes.js.map