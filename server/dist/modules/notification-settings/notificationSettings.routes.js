"use strict";
// ============================================
// Notification Settings Module
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /notification-settings — Get my settings
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    let settings = await database_1.default.notificationSetting.findUnique({ where: { userId: user.userId } });
    if (!settings) {
        settings = await database_1.default.notificationSetting.create({ data: { userId: user.userId } });
    }
    (0, apiResponse_1.sendResponse)({ res, data: settings });
}));
// PATCH /notification-settings — Update my settings
router.patch('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const data = {};
    const fields = [
        'emailNotifications', 'pushNotifications', 'taskAssigned', 'taskUpdated',
        'taskCompleted', 'commentAdded', 'mentionNotification', 'sprintUpdates',
        'projectUpdates', 'dailyDigest', 'weeklyReport',
    ];
    fields.forEach(f => { if (req.body[f] !== undefined)
        data[f] = req.body[f]; });
    const settings = await database_1.default.notificationSetting.upsert({
        where: { userId: user.userId },
        update: data,
        create: { userId: user.userId, ...data },
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Settings updated', data: settings });
}));
exports.default = router;
//# sourceMappingURL=notificationSettings.routes.js.map