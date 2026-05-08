"use strict";
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
router.get('/events', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = { organizationId: user.organizationId };
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    if (req.query.userId)
        where.userId = req.query.userId;
    const events = await database_1.default.calendarEvent.findMany({
        where,
        orderBy: { startTime: 'asc' },
        include: { user: { select: { id: true, firstName: true, lastName: true } } }
    });
    (0, apiResponse_1.sendResponse)({ res, data: events });
}));
router.post('/events', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const event = await database_1.default.calendarEvent.create({
        data: {
            title: req.body.title,
            description: req.body.description,
            startTime: new Date(req.body.startTime),
            endTime: new Date(req.body.endTime),
            isAllDay: req.body.isAllDay || false,
            location: req.body.location,
            userId: user.userId,
            projectId: req.body.projectId,
            organizationId: user.organizationId
        }
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: event });
}));
router.patch('/events/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const event = await database_1.default.calendarEvent.update({
        where: { id: (0, params_1.p)(req.params.id) },
        data: req.body
    });
    (0, apiResponse_1.sendResponse)({ res, data: event });
}));
router.delete('/events/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.calendarEvent.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Event deleted' });
}));
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map