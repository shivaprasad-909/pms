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
exports.getCapacityAnalytics = exports.getWorkloadHeatmap = exports.getResourceAllocation = exports.getDeveloperProductivity = exports.getManagerCompletionTrend = exports.getManagerWorkload = exports.getDeveloperOverview = exports.getProjectBurndown = exports.getTimeTrackingSummary = exports.getProductivity = exports.getSprintVelocity = exports.getTeamWorkload = exports.getProjectCompletionTrend = exports.getFounderOverview = exports.getDashboard = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const analyticsService = __importStar(require("./analytics.service"));
exports.getDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getDashboardData(user.userId, user.role, user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getFounderOverview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getFounderOverview(user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getProjectCompletionTrend = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const months = parseInt((0, params_1.p)(req.query.months) || '12');
    const result = await analyticsService.getProjectCompletionTrend(user.organizationId, months);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getTeamWorkload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getTeamWorkload(user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getSprintVelocity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const count = parseInt((0, params_1.p)(req.query.count) || '8');
    const result = await analyticsService.getSprintVelocity(user.organizationId, count);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getProductivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const days = parseInt((0, params_1.p)(req.query.days) || '30');
    const result = await analyticsService.getProductivity(user.organizationId, days);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getTimeTrackingSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getTimeTrackingSummary(user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getProjectBurndown = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await analyticsService.getProjectBurndown((0, params_1.p)(req.params.sprintId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getDeveloperOverview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getDeveloperOverview(user.userId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getManagerWorkload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getManagerWorkload(user.userId, user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getManagerCompletionTrend = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const months = parseInt((0, params_1.p)(req.query.months) || '6');
    const result = await analyticsService.getManagerCompletionTrend(user.userId, months);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getDeveloperProductivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const days = parseInt((0, params_1.p)(req.query.days) || '30');
    const result = await analyticsService.getDeveloperProductivity(user.userId, days);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getResourceAllocation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getResourceAllocation(user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getWorkloadHeatmap = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getWorkloadHeatmap(user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getCapacityAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await analyticsService.getCapacityAnalytics(user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
//# sourceMappingURL=analytics.controller.js.map