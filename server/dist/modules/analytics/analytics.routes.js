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
const ctrl = __importStar(require("./analytics.controller"));
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Unified dashboard
router.get('/dashboard', ctrl.getDashboard);
// Founder/Admin analytics
router.get('/founder/overview', authorize_1.adminOrAbove, ctrl.getFounderOverview);
router.get('/founder/projects-completion-trend', authorize_1.adminOrAbove, ctrl.getProjectCompletionTrend);
router.get('/founder/team-workload', authorize_1.adminOrAbove, ctrl.getTeamWorkload);
router.get('/founder/sprint-velocity', authorize_1.adminOrAbove, ctrl.getSprintVelocity);
router.get('/founder/productivity', authorize_1.adminOrAbove, ctrl.getProductivity);
router.get('/founder/time-tracking-summary', authorize_1.adminOrAbove, ctrl.getTimeTrackingSummary);
// Manager analytics
router.get('/manager/burndown/:sprintId', authorize_1.managerOrAbove, ctrl.getProjectBurndown);
router.get('/manager/workload', authorize_1.managerOrAbove, ctrl.getManagerWorkload);
router.get('/manager/completion-trend', authorize_1.managerOrAbove, ctrl.getManagerCompletionTrend);
// Developer analytics
router.get('/developer/me', ctrl.getDeveloperOverview);
router.get('/developer/productivity', ctrl.getDeveloperProductivity);
// Advanced analytics (Admin+)
router.get('/resource-allocation', authorize_1.adminOrAbove, ctrl.getResourceAllocation);
router.get('/workload-heatmap', authorize_1.adminOrAbove, ctrl.getWorkloadHeatmap);
router.get('/capacity', authorize_1.adminOrAbove, ctrl.getCapacityAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map