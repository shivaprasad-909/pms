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
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const where = {};
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    const fields = await database_1.default.customField.findMany({
        where,
        orderBy: { createdAt: 'asc' }
    });
    (0, apiResponse_1.sendResponse)({ res, data: fields });
}));
router.post('/', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const field = await database_1.default.customField.create({
        data: {
            name: req.body.name,
            type: req.body.type || 'TEXT',
            options: req.body.options,
            projectId: req.body.projectId
        }
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: field });
}));
router.patch('/:id', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const field = await database_1.default.customField.update({
        where: { id: (0, params_1.p)(req.params.id) },
        data: req.body
    });
    (0, apiResponse_1.sendResponse)({ res, data: field });
}));
router.delete('/:id', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.customField.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Custom field deleted' });
}));
exports.default = router;
//# sourceMappingURL=customField.routes.js.map