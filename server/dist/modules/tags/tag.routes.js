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
    const user = req.user;
    const tags = await database_1.default.tag.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' }
    });
    (0, apiResponse_1.sendResponse)({ res, data: tags });
}));
router.post('/', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const tag = await database_1.default.tag.create({
        data: {
            name: req.body.name,
            color: req.body.color,
            organizationId: user.organizationId
        }
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: tag });
}));
router.patch('/:id', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const tag = await database_1.default.tag.update({
        where: { id: (0, params_1.p)(req.params.id) },
        data: req.body
    });
    (0, apiResponse_1.sendResponse)({ res, data: tag });
}));
router.delete('/:id', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.tag.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Tag deleted' });
}));
exports.default = router;
//# sourceMappingURL=tag.routes.js.map