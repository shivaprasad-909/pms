"use strict";
// ============================================
// Workspace Module — Full CRUD
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
// GET /workspaces
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const workspaces = await database_1.default.workspace.findMany({
        where: { organizationId: user.organizationId, isArchived: false },
        include: {
            _count: { select: { projects: true } },
        },
        orderBy: { name: 'asc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: workspaces });
}));
// POST /workspaces
router.post('/', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { createSlug, generateUniqueSlug } = await Promise.resolve().then(() => __importStar(require('../../utils/helpers')));
    let slug = createSlug(req.body.name);
    const existing = await database_1.default.workspace.findUnique({ where: { slug } });
    if (existing)
        slug = generateUniqueSlug(slug);
    const workspace = await database_1.default.workspace.create({
        data: {
            name: req.body.name,
            slug,
            description: req.body.description,
            color: req.body.color,
            organizationId: user.organizationId,
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Workspace created', data: workspace });
}));
// GET /workspaces/:workspaceId
router.get('/:workspaceId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspace = await database_1.default.workspace.findUnique({
        where: { id: (0, params_1.p)(req.params.workspaceId) },
        include: {
            projects: {
                include: {
                    _count: { select: { tasks: true, members: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            },
            _count: { select: { projects: true } },
        },
    });
    if (!workspace) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Workspace not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: workspace });
}));
// PATCH /workspaces/:workspaceId
router.patch('/:workspaceId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.description !== undefined)
        data.description = req.body.description;
    if (req.body.color !== undefined)
        data.color = req.body.color;
    if (req.body.isArchived !== undefined)
        data.isArchived = req.body.isArchived;
    const workspace = await database_1.default.workspace.update({
        where: { id: (0, params_1.p)(req.params.workspaceId) },
        data,
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Workspace updated', data: workspace });
}));
// DELETE /workspaces/:workspaceId
router.delete('/:workspaceId', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.workspace.delete({ where: { id: (0, params_1.p)(req.params.workspaceId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Workspace deleted' });
}));
exports.default = router;
//# sourceMappingURL=workspace.routes.js.map