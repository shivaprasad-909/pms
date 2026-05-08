"use strict";
// ============================================
// Auth Module — Controller
// ============================================
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
exports.resetPassword = exports.forgotPassword = exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = exports.setup = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const authService = __importStar(require("./auth.service"));
exports.setup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { organizationName, email, password, firstName, lastName } = req.body;
    const result = await authService.setupOrganization(organizationName, { email, password, firstName, lastName });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Organization created successfully', data: result });
});
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await authService.registerUser({ ...req.body, organizationId: user.organizationId });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'User registered successfully', data: result });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    (0, apiResponse_1.sendResponse)({ res, message: 'Login successful', data: result });
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return (0, apiResponse_1.sendResponse)({ res, statusCode: 401, success: false, message: 'Refresh token is required' });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    (0, apiResponse_1.sendResponse)({ res, message: 'Token refreshed', data: result });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    await authService.logoutUser(user.userId);
    (0, apiResponse_1.sendResponse)({ res, message: 'Logged out successfully' });
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await authService.getCurrentUser(user.userId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    (0, apiResponse_1.sendResponse)({ res, message: 'If the email exists, a reset token has been generated', data: result });
});
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    (0, apiResponse_1.sendResponse)({ res, message: 'Password has been reset successfully' });
});
//# sourceMappingURL=auth.controller.js.map