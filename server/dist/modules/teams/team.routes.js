"use strict";
// ============================================
// Teams Module — Full CRUD + Members
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
// GET /teams
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const teams = await database_1.default.team.findMany({
        where: { organizationId: user.organizationId },
        include: {
            members: {
                include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
                take: 10,
            },
            _count: { select: { members: true } },
        },
        orderBy: { name: 'asc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: teams });
}));
// POST /teams
router.post('/', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { createSlug, generateUniqueSlug } = await Promise.resolve().then(() => __importStar(require('../../utils/helpers')));
    let slug = createSlug(req.body.name);
    const existing = await database_1.default.team.findUnique({ where: { slug } });
    if (existing)
        slug = generateUniqueSlug(slug);
    const team = await database_1.default.team.create({
        data: {
            name: req.body.name,
            slug,
            description: req.body.description,
            avatar: req.body.avatar,
            color: req.body.color,
            organizationId: user.organizationId,
            members: { create: { userId: user.userId, role: 'lead' } },
        },
        include: {
            members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
            _count: { select: { members: true } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Team created', data: team });
}));
// GET /teams/:teamId
router.get('/:teamId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const team = await database_1.default.team.findUnique({
        where: { id: (0, params_1.p)(req.params.teamId) },
        include: {
            members: {
                include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true, designation: true } } },
            },
            _count: { select: { members: true } },
        },
    });
    if (!team) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Team not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: team });
}));
// PATCH /teams/:teamId
router.patch('/:teamId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.description !== undefined)
        data.description = req.body.description;
    if (req.body.avatar !== undefined)
        data.avatar = req.body.avatar;
    if (req.body.color !== undefined)
        data.color = req.body.color;
    const team = await database_1.default.team.update({ where: { id: (0, params_1.p)(req.params.teamId) }, data });
    (0, apiResponse_1.sendResponse)({ res, message: 'Team updated', data: team });
}));
// DELETE /teams/:teamId
router.delete('/:teamId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.team.delete({ where: { id: (0, params_1.p)(req.params.teamId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Team deleted' });
}));
// GET /teams/:teamId/members
router.get('/:teamId/members', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const members = await database_1.default.teamMember.findMany({
        where: { teamId: (0, params_1.p)(req.params.teamId) },
        include: {
            user: {
                select: {
                    id: true, firstName: true, lastName: true, email: true,
                    avatar: true, role: true, designation: true, department: true,
                },
            },
        },
        orderBy: { joinedAt: 'asc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: members });
}));
// POST /teams/:teamId/members
router.post('/:teamId/members', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const member = await database_1.default.teamMember.create({
        data: {
            teamId: (0, params_1.p)(req.params.teamId),
            userId: req.body.userId,
            role: req.body.role || 'member',
        },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Member added', data: member });
}));
// DELETE /teams/:teamId/members/:userId
router.delete('/:teamId/members/:userId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.teamMember.delete({
        where: { teamId_userId: { teamId: (0, params_1.p)(req.params.teamId), userId: (0, params_1.p)(req.params.userId) } },
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Member removed' });
}));
exports.default = router;
//# sourceMappingURL=team.routes.js.map