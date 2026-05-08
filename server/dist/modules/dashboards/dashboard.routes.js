"use strict";
// ============================================
// Dashboards Module — Full CRUD + Widgets
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
// GET /dashboards
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const dashboards = await database_1.default.dashboard.findMany({
        where: { organizationId: user.organizationId },
        include: { _count: { select: { widgets: true } } },
        orderBy: { createdAt: 'desc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: dashboards });
}));
// POST /dashboards
router.post('/', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const dashboard = await database_1.default.dashboard.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            layout: req.body.layout,
            organizationId: user.organizationId,
            createdById: user.userId,
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Dashboard created', data: dashboard });
}));
// GET /dashboards/:dashboardId
router.get('/:dashboardId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const dashboard = await database_1.default.dashboard.findUnique({
        where: { id: (0, params_1.p)(req.params.dashboardId) },
        include: { widgets: { orderBy: { createdAt: 'asc' } } },
    });
    if (!dashboard) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Dashboard not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: dashboard });
}));
// PATCH /dashboards/:dashboardId
router.patch('/:dashboardId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.description !== undefined)
        data.description = req.body.description;
    if (req.body.layout !== undefined)
        data.layout = req.body.layout;
    if (req.body.isDefault !== undefined)
        data.isDefault = req.body.isDefault;
    const dashboard = await database_1.default.dashboard.update({ where: { id: (0, params_1.p)(req.params.dashboardId) }, data });
    (0, apiResponse_1.sendResponse)({ res, message: 'Dashboard updated', data: dashboard });
}));
// DELETE /dashboards/:dashboardId
router.delete('/:dashboardId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.dashboard.delete({ where: { id: (0, params_1.p)(req.params.dashboardId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Dashboard deleted' });
}));
// --- WIDGETS ---
// GET /dashboards/:dashboardId/widgets
router.get('/:dashboardId/widgets', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const widgets = await database_1.default.dashboardWidget.findMany({
        where: { dashboardId: (0, params_1.p)(req.params.dashboardId) },
        orderBy: { createdAt: 'asc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: widgets });
}));
// POST /dashboards/:dashboardId/widgets
router.post('/:dashboardId/widgets', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const widget = await database_1.default.dashboardWidget.create({
        data: {
            title: req.body.title,
            type: req.body.type,
            config: req.body.config,
            position: req.body.position,
            dataSource: req.body.dataSource,
            dashboardId: (0, params_1.p)(req.params.dashboardId),
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Widget created', data: widget });
}));
// PATCH /dashboards/:dashboardId/widgets/:widgetId
router.patch('/:dashboardId/widgets/:widgetId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.title !== undefined)
        data.title = req.body.title;
    if (req.body.type !== undefined)
        data.type = req.body.type;
    if (req.body.config !== undefined)
        data.config = req.body.config;
    if (req.body.position !== undefined)
        data.position = req.body.position;
    if (req.body.dataSource !== undefined)
        data.dataSource = req.body.dataSource;
    const widget = await database_1.default.dashboardWidget.update({ where: { id: (0, params_1.p)(req.params.widgetId) }, data });
    (0, apiResponse_1.sendResponse)({ res, message: 'Widget updated', data: widget });
}));
// DELETE /dashboards/:dashboardId/widgets/:widgetId
router.delete('/:dashboardId/widgets/:widgetId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.dashboardWidget.delete({ where: { id: (0, params_1.p)(req.params.widgetId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Widget deleted' });
}));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map