"use strict";
// ============================================
// Users Module — Service
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTimeSummary = exports.deactivateUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const database_1 = __importDefault(require("../../config/database"));
const AppError_1 = require("../../errors/AppError");
const helpers_1 = require("../../utils/helpers");
const USER_SELECT = {
    id: true, email: true, firstName: true, lastName: true,
    role: true, avatar: true, phone: true, designation: true,
    department: true, isActive: true, organizationId: true,
    weeklyCapacity: true, createdAt: true, updatedAt: true, lastLoginAt: true,
};
const getUsers = async (organizationId, userId, role, filters) => {
    const where = { organizationId };
    if (role === 'DEVELOPER') {
        where.id = userId; // can only see self
    }
    if (filters.search) {
        where.OR = [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.role)
        where.role = filters.role;
    if (filters.isActive !== undefined)
        where.isActive = filters.isActive === 'true';
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        database_1.default.user.findMany({
            where, skip, take: limit,
            select: {
                ...USER_SELECT,
                _count: { select: { taskAssignments: true, managedProjects: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.user.count({ where }),
    ]);
    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await database_1.default.user.findUnique({
        where: { id },
        select: {
            ...USER_SELECT,
            organization: { select: { id: true, name: true } },
            _count: { select: { taskAssignments: true, managedProjects: true, timeLogs: true, comments: true } },
        },
    });
    if (!user)
        throw new AppError_1.NotFoundError('User');
    return user;
};
exports.getUserById = getUserById;
const updateUser = async (id, data, requesterId, requesterRole) => {
    const user = await database_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new AppError_1.NotFoundError('User');
    // Developers can only update their own profile
    if (requesterRole === 'DEVELOPER' && id !== requesterId) {
        throw new AppError_1.ForbiddenError('You can only update your own profile');
    }
    // Only Founder/Admin can change roles
    if (data.role && !['FOUNDER', 'ADMIN'].includes(requesterRole)) {
        throw new AppError_1.ForbiddenError('Only Founder/Admin can change user roles');
    }
    const updateData = {};
    if (data.firstName)
        updateData.firstName = data.firstName;
    if (data.lastName)
        updateData.lastName = data.lastName;
    if (data.phone !== undefined)
        updateData.phone = data.phone;
    if (data.designation !== undefined)
        updateData.designation = data.designation;
    if (data.department !== undefined)
        updateData.department = data.department;
    if (data.avatar !== undefined)
        updateData.avatar = data.avatar;
    if (data.weeklyCapacity !== undefined)
        updateData.weeklyCapacity = data.weeklyCapacity;
    if (data.role)
        updateData.role = data.role;
    if (data.isActive !== undefined)
        updateData.isActive = data.isActive;
    if (data.password) {
        updateData.password = await (0, helpers_1.hashPassword)(data.password);
    }
    return database_1.default.user.update({ where: { id }, data: updateData, select: USER_SELECT });
};
exports.updateUser = updateUser;
const deactivateUser = async (id) => {
    const user = await database_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new AppError_1.NotFoundError('User');
    if (user.role === 'FOUNDER')
        throw new AppError_1.ForbiddenError('Cannot deactivate the Founder');
    return database_1.default.user.update({ where: { id }, data: { isActive: false, refreshToken: null }, select: USER_SELECT });
};
exports.deactivateUser = deactivateUser;
const getUserTimeSummary = async (userId, filters) => {
    const where = { userId };
    if (filters.from)
        where.logDate = { ...where.logDate, gte: new Date(filters.from) };
    if (filters.to)
        where.logDate = { ...where.logDate, lte: new Date(filters.to) };
    const [totalHours, byProject, byDay] = await Promise.all([
        database_1.default.timeLog.aggregate({ where, _sum: { hours: true } }),
        database_1.default.timeLog.groupBy({
            by: ['taskId'], where,
            _sum: { hours: true },
        }),
        database_1.default.timeLog.groupBy({
            by: ['logDate'], where,
            _sum: { hours: true },
            orderBy: { logDate: 'asc' },
        }),
    ]);
    return {
        totalHours: totalHours._sum.hours || 0,
        dailyBreakdown: byDay.map(d => ({ date: d.logDate, hours: d._sum.hours || 0 })),
    };
};
exports.getUserTimeSummary = getUserTimeSummary;
//# sourceMappingURL=user.service.js.map