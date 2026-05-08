"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const userService = __importStar(require("./user.service"));
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await userService.getUsers(user.organizationId, user.userId, user.role, req.query);
    (0, apiResponse_1.sendResponse)({ res, data: result.users, pagination: result.pagination });
}));
router.get('/me', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await userService.getUserById(user.userId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
}));
router.get('/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await userService.getUserById((0, params_1.p)(req.params.userId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
}));
router.patch('/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await userService.updateUser((0, params_1.p)(req.params.userId), req.body, user.userId, user.role);
    (0, apiResponse_1.sendResponse)({ res, message: 'User updated', data: result });
}));
router.delete('/:userId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await userService.deactivateUser((0, params_1.p)(req.params.userId));
    (0, apiResponse_1.sendResponse)({ res, message: 'User deactivated', data: result });
}));
router.get('/:userId/time-summary', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await userService.getUserTimeSummary((0, params_1.p)(req.params.userId), req.query);
    (0, apiResponse_1.sendResponse)({ res, data: result });
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map