"use strict";
// ============================================
// Auth Module — Service
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
exports.resetPassword = exports.forgotPassword = exports.getCurrentUser = exports.setupOrganization = exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = exports.DEFAULT_PERMISSIONS = void 0;
const database_1 = __importDefault(require("../../config/database"));
const helpers_1 = require("../../utils/helpers");
const AppError_1 = require("../../errors/AppError");
exports.DEFAULT_PERMISSIONS = {
    FOUNDER: ['*'],
    ADMIN: ['*'],
    MANAGER: ['dashboard.view', 'projects.view', 'projects.create', 'tasks.view', 'tasks.update', 'analytics.view', 'reports.view', 'chat.access', 'teams.manage'],
    DEVELOPER: ['dashboard.view', 'projects.view', 'tasks.view', 'tasks.update', 'chat.access'],
    STAKEHOLDER: ['dashboard.view', 'projects.view', 'reports.view']
};
const getMergedPermissions = (role, uiPermissions) => {
    if (role === 'FOUNDER' || role === 'ADMIN')
        return ['*'];
    const defaults = exports.DEFAULT_PERMISSIONS[role] || [];
    const merged = new Set([...defaults, ...(uiPermissions || [])]);
    return Array.from(merged);
};
const USER_SELECT = {
    id: true, email: true, firstName: true, lastName: true,
    role: true, avatar: true, phone: true, designation: true,
    department: true, isActive: true, organizationId: true,
    uiPermissions: true, weeklyCapacity: true, createdAt: true, lastLoginAt: true,
};
const registerUser = async (input) => {
    const existing = await database_1.default.user.findUnique({ where: { email: input.email } });
    if (existing)
        throw new AppError_1.ConflictError('A user with this email already exists');
    const hashedPassword = await (0, helpers_1.hashPassword)(input.password);
    const user = await database_1.default.user.create({
        data: {
            email: input.email,
            password: hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
            role: input.role || 'DEVELOPER',
            phone: input.phone,
            designation: input.designation,
            department: input.department,
            uiPermissions: input.uiPermissions || [],
            organizationId: input.organizationId,
        },
        select: USER_SELECT,
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await database_1.default.user.findUnique({
        where: { email },
        include: { organization: { select: { id: true, name: true, slug: true } } },
    });
    if (!user)
        throw new AppError_1.UnauthorizedError('Invalid email or password');
    if (!user.isActive)
        throw new AppError_1.UnauthorizedError('Your account has been deactivated');
    const valid = await (0, helpers_1.comparePassword)(password, user.password);
    if (!valid)
        throw new AppError_1.UnauthorizedError('Invalid email or password');
    const permissions = getMergedPermissions(user.role, user.uiPermissions);
    const payload = {
        userId: user.id, email: user.email,
        role: user.role, organizationId: user.organizationId,
        permissions,
    };
    const accessToken = (0, helpers_1.generateAccessToken)(payload);
    const refreshToken = (0, helpers_1.generateRefreshToken)(payload);
    await database_1.default.user.update({
        where: { id: user.id },
        data: { refreshToken, lastLoginAt: new Date() },
    });
    const { password: _, refreshToken: __, ...userData } = user;
    return { user: { ...userData, permissions }, accessToken, refreshToken };
};
exports.loginUser = loginUser;
const refreshAccessToken = async (token) => {
    const decoded = (0, helpers_1.verifyRefreshToken)(token);
    const user = await database_1.default.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== token)
        throw new AppError_1.UnauthorizedError('Invalid refresh token');
    if (!user.isActive)
        throw new AppError_1.UnauthorizedError('Account is deactivated');
    const permissions = getMergedPermissions(user.role, user.uiPermissions);
    const payload = {
        userId: user.id, email: user.email,
        role: user.role, organizationId: user.organizationId,
        permissions,
    };
    const accessToken = (0, helpers_1.generateAccessToken)(payload);
    const refreshToken = (0, helpers_1.generateRefreshToken)(payload);
    await database_1.default.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });
    return { accessToken, refreshToken };
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (userId) => {
    await database_1.default.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
exports.logoutUser = logoutUser;
const setupOrganization = async (orgName, userData) => {
    const existingOrg = await database_1.default.organization.findFirst();
    if (existingOrg)
        throw new AppError_1.ConflictError('Organization already exists');
    let slug = (0, helpers_1.createSlug)(orgName);
    const existingSlug = await database_1.default.organization.findUnique({ where: { slug } });
    if (existingSlug)
        slug = (0, helpers_1.generateUniqueSlug)(slug);
    const result = await database_1.default.$transaction(async (tx) => {
        const org = await tx.organization.create({ data: { name: orgName, slug } });
        const hashedPassword = await (0, helpers_1.hashPassword)(userData.password);
        const founder = await tx.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: 'FOUNDER',
                organizationId: org.id,
            },
            select: USER_SELECT,
        });
        // Create a default #general channel
        await tx.chatChannel.create({
            data: {
                name: 'General',
                description: 'Organization-wide channel',
                type: 'GENERAL',
                organizationId: org.id,
                members: { create: { userId: founder.id } },
            },
        });
        return { organization: org, founder };
    });
    const permissions = getMergedPermissions(result.founder.role, []);
    const payload = {
        userId: result.founder.id,
        email: result.founder.email,
        role: result.founder.role,
        organizationId: result.founder.organizationId,
        permissions,
    };
    const accessToken = (0, helpers_1.generateAccessToken)(payload);
    const refreshToken = (0, helpers_1.generateRefreshToken)(payload);
    await database_1.default.user.update({
        where: { id: result.founder.id },
        data: { refreshToken, lastLoginAt: new Date() },
    });
    return { organization: result.organization, user: { ...result.founder, permissions }, accessToken, refreshToken };
};
exports.setupOrganization = setupOrganization;
const getCurrentUser = async (userId) => {
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
        select: { ...USER_SELECT, organization: { select: { id: true, name: true, slug: true, logo: true } } },
    });
    if (!user)
        throw new AppError_1.NotFoundError('User');
    const permissions = getMergedPermissions(user.role, user.uiPermissions);
    return { ...user, permissions };
};
exports.getCurrentUser = getCurrentUser;
const forgotPassword = async (email) => {
    const user = await database_1.default.user.findUnique({ where: { email } });
    if (!user)
        return { message: 'If the email exists, a reset token has been generated' };
    // Invalidate existing tokens
    await database_1.default.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
    });
    // Create new token (UUID-based)
    const { v4: uuidv4 } = await Promise.resolve().then(() => __importStar(require('uuid')));
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await database_1.default.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
    });
    // In production, send email here. For now, return the token.
    return { resetToken: token, expiresAt };
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
    const resetToken = await database_1.default.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken)
        throw new AppError_1.UnauthorizedError('Invalid reset token');
    if (resetToken.used)
        throw new AppError_1.UnauthorizedError('Token has already been used');
    if (resetToken.expiresAt < new Date())
        throw new AppError_1.UnauthorizedError('Token has expired');
    const hashedPassword = await (0, helpers_1.hashPassword)(newPassword);
    await database_1.default.$transaction([
        database_1.default.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword, refreshToken: null },
        }),
        database_1.default.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        }),
    ]);
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.service.js.map