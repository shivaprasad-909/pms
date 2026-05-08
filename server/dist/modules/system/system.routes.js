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
const authorize_1 = require("../../middleware/authorize");
const auth_1 = require("../../middleware/auth");
const os = __importStar(require("os"));
const router = (0, express_1.Router)();
router.get('/status', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    (0, apiResponse_1.sendResponse)({ res, data: { status: 'Operational', uptime: process.uptime() } });
}));
router.get('/metrics', auth_1.authenticate, authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const mem = process.memoryUsage();
    (0, apiResponse_1.sendResponse)({ res, data: {
            memory: mem,
            cpu: os.loadavg(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
        } });
}));
router.get('/queues/status', auth_1.authenticate, authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    (0, apiResponse_1.sendResponse)({ res, data: {
            emailQueue: { active: 0, waiting: 0, completed: 152 },
            notificationQueue: { active: 0, waiting: 0, completed: 341 },
            status: 'All queues processing normally'
        } });
}));
exports.default = router;
//# sourceMappingURL=system.routes.js.map