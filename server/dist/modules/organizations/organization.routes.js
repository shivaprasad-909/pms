"use strict";
// ============================================
// Organization Module — Routes + Controller
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
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /organization — Current organization
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const org = await database_1.default.organization.findUnique({
        where: { id: user.organizationId },
        include: {
            _count: { select: { users: true, projects: true, teams: true, workspaces: true } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, data: org });
}));
// PATCH /organization — Update org (Founder/Admin)
router.patch('/', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.description !== undefined)
        data.description = req.body.description;
    if (req.body.logo !== undefined)
        data.logo = req.body.logo;
    if (req.body.website !== undefined)
        data.website = req.body.website;
    if (req.body.timezone !== undefined)
        data.timezone = req.body.timezone;
    const org = await database_1.default.organization.update({
        where: { id: user.organizationId },
        data,
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Organization updated', data: org });
}));
// GET /organization/members — Org members (Admin/Founder)
router.get('/members', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const where = { organizationId: user.organizationId };
    if (req.query.search) {
        where.OR = [
            { firstName: { contains: req.query.search, mode: 'insensitive' } },
            { lastName: { contains: req.query.search, mode: 'insensitive' } },
            { email: { contains: req.query.search, mode: 'insensitive' } },
        ];
    }
    if (req.query.role)
        where.role = req.query.role;
    if (req.query.isActive !== undefined)
        where.isActive = req.query.isActive === 'true';
    const [members, total] = await Promise.all([
        database_1.default.user.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true, email: true, firstName: true, lastName: true,
                role: true, avatar: true, isActive: true, designation: true,
                department: true, lastLoginAt: true, createdAt: true,
                _count: { select: { taskAssignments: true, managedProjects: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.user.count({ where }),
    ]);
    (0, apiResponse_1.sendResponse)({ res, data: members, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));
// POST /organization/invite — Invite user (Admin/Founder)
router.post('/invite', authorize_1.adminOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { email, firstName, lastName, role, designation, department } = req.body;
    const existing = await database_1.default.user.findUnique({ where: { email } });
    if (existing) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 409, message: 'User with this email already exists' });
        return;
    }
    const { hashPassword } = await Promise.resolve().then(() => __importStar(require('../../utils/helpers')));
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const hashedPassword = await hashPassword(tempPassword);
    const newUser = await database_1.default.user.create({
        data: {
            email, firstName, lastName,
            password: hashedPassword,
            role: role || 'DEVELOPER',
            designation, department,
            organizationId: user.organizationId,
        },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            role: true, designation: true, department: true, createdAt: true,
        },
    });
    // Log activity
    await database_1.default.activityLog.create({
        data: {
            action: 'INVITED', entityType: 'USER', entityId: newUser.id,
            userId: user.userId, organizationId: user.organizationId,
            details: { invitedEmail: email, role: role || 'DEVELOPER' },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'User invited successfully', data: { user: newUser, tempPassword } });
}));
exports.default = router;
//# sourceMappingURL=organization.routes.js.map