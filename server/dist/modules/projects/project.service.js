"use strict";
// ============================================
// Projects Module — Service
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCompletion = exports.approveCompletion = exports.submitForCompletion = exports.getProjectTimeSummary = exports.updateProjectMemberRole = exports.getProjectMembers = exports.removeProjectMember = exports.addProjectMember = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const database_1 = __importDefault(require("../../config/database"));
const AppError_1 = require("../../errors/AppError");
const helpers_1 = require("../../utils/helpers");
const createProject = async (input, userId, organizationId) => {
    let slug = (0, helpers_1.createSlug)(input.name);
    const existing = await database_1.default.project.findUnique({ where: { slug } });
    if (existing)
        slug = (0, helpers_1.generateUniqueSlug)(slug);
    const project = await database_1.default.$transaction(async (tx) => {
        const proj = await tx.project.create({
            data: {
                name: input.name, slug,
                description: input.description,
                priority: input.priority || 'MEDIUM',
                startDate: input.startDate ? new Date(input.startDate) : null,
                endDate: input.endDate ? new Date(input.endDate) : null,
                budget: input.budget,
                organizationId, createdById: userId,
            },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
        // Create default board with columns
        const board = await tx.board.create({
            data: {
                name: 'Default Board', projectId: proj.id,
                columns: {
                    createMany: {
                        data: [
                            { name: 'To Do', color: '#636E72', position: 0, taskStatus: 'TODO' },
                            { name: 'In Progress', color: '#6C5CE7', position: 1, taskStatus: 'IN_PROGRESS' },
                            { name: 'In Review', color: '#F39C12', position: 2, taskStatus: 'IN_REVIEW' },
                            { name: 'Done', color: '#00B894', position: 3, taskStatus: 'DONE' },
                        ],
                    },
                },
            },
        });
        // Create project channel
        await tx.chatChannel.create({
            data: {
                name: input.name, type: 'PROJECT',
                organizationId, projectId: proj.id,
                members: { create: { userId } },
            },
        });
        return proj;
    });
    return project;
};
exports.createProject = createProject;
const getProjects = async (userId, role, organizationId, filters) => {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;
    const where = { organizationId };
    if (role === 'MANAGER' || role === 'DEVELOPER') {
        where.members = { some: { userId } };
    }
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.status)
        where.status = filters.status;
    if (filters.priority)
        where.priority = filters.priority;
    const [projects, total] = await Promise.all([
        database_1.default.project.findMany({
            where, skip, take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                members: {
                    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
                    take: 8,
                },
                _count: { select: { tasks: true, sprints: true, members: true } },
            },
        }),
        database_1.default.project.count({ where }),
    ]);
    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(projects.map(async (p) => {
        const taskStats = await database_1.default.task.groupBy({
            by: ['status'], where: { projectId: p.id }, _count: { status: true },
        });
        const total = taskStats.reduce((s, t) => s + t._count.status, 0);
        const done = taskStats.find(t => t.status === 'DONE')?._count.status || 0;
        return { ...p, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
    }));
    return { projects: projectsWithProgress, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
exports.getProjects = getProjects;
const getProjectById = async (projectId, userId, role) => {
    const project = await database_1.default.project.findUnique({
        where: { id: projectId },
        include: {
            createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            members: {
                include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true, designation: true } } },
            },
            sprints: { orderBy: { startDate: 'desc' } },
            boards: { include: { columns: { orderBy: { position: 'asc' } } } },
            _count: { select: { tasks: true, sprints: true, documents: true, members: true } },
        },
    });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    if ((role === 'MANAGER' || role === 'DEVELOPER') && !project.members.some(m => m.userId === userId)) {
        throw new AppError_1.ForbiddenError('You do not have access to this project');
    }
    // Task stats
    const taskStats = await database_1.default.task.groupBy({
        by: ['status'], where: { projectId }, _count: { status: true },
    });
    const totalTasks = taskStats.reduce((s, t) => s + t._count.status, 0);
    const doneTasks = taskStats.find(t => t.status === 'DONE')?._count.status || 0;
    const overdueTasks = await database_1.default.task.count({
        where: { projectId, dueDate: { lt: new Date() }, status: { notIn: ['DONE'] } },
    });
    return {
        ...project,
        progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        taskStats: {
            total: totalTasks, overdue: overdueTasks,
            byStatus: taskStats.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {}),
        },
    };
};
exports.getProjectById = getProjectById;
const updateProject = async (projectId, input, userId, role) => {
    const project = await database_1.default.project.findUnique({ where: { id: projectId }, include: { members: true } });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    if (role === 'MANAGER' && !project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
        throw new AppError_1.ForbiddenError('You can only edit projects you manage');
    }
    const updateData = {};
    if (input.name) {
        updateData.name = input.name;
        let slug = (0, helpers_1.createSlug)(input.name);
        const exists = await database_1.default.project.findFirst({ where: { slug, id: { not: projectId } } });
        updateData.slug = exists ? (0, helpers_1.generateUniqueSlug)(slug) : slug;
    }
    if (input.description !== undefined)
        updateData.description = input.description;
    if (input.status) {
        updateData.status = input.status;
        if (input.status === 'COMPLETED')
            updateData.completedAt = new Date();
    }
    if (input.priority)
        updateData.priority = input.priority;
    if (input.startDate)
        updateData.startDate = new Date(input.startDate);
    if (input.endDate)
        updateData.endDate = new Date(input.endDate);
    if (input.budget !== undefined)
        updateData.budget = input.budget;
    return database_1.default.project.update({
        where: { id: projectId }, data: updateData,
        include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
            members: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
        },
    });
};
exports.updateProject = updateProject;
const deleteProject = async (projectId) => {
    const project = await database_1.default.project.findUnique({ where: { id: projectId } });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    await database_1.default.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted successfully' };
};
exports.deleteProject = deleteProject;
const addProjectMember = async (projectId, userId, memberRole) => {
    const existing = await database_1.default.projectMember.findUnique({
        where: { userId_projectId: { userId, projectId } },
    });
    if (existing)
        throw new Error('User is already a member');
    return database_1.default.$transaction(async (tx) => {
        const member = await tx.projectMember.create({
            data: { userId, projectId, role: memberRole },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
        });
        // Auto-add to project group chat
        const channel = await tx.chatChannel.findFirst({ where: { projectId, type: 'PROJECT' } });
        if (channel) {
            await tx.channelMember.upsert({
                where: { channelId_userId: { channelId: channel.id, userId } },
                create: { channelId: channel.id, userId },
                update: {},
            });
        }
        return member;
    });
};
exports.addProjectMember = addProjectMember;
const removeProjectMember = async (projectId, userId) => {
    await database_1.default.$transaction(async (tx) => {
        await tx.projectMember.delete({ where: { userId_projectId: { userId, projectId } } });
        // Auto-remove from project group chat
        const channel = await tx.chatChannel.findFirst({ where: { projectId, type: 'PROJECT' } });
        if (channel) {
            await tx.channelMember.deleteMany({
                where: { channelId: channel.id, userId }
            });
        }
    });
    return { message: 'Member removed' };
};
exports.removeProjectMember = removeProjectMember;
const getProjectMembers = async (projectId) => {
    return database_1.default.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    id: true, firstName: true, lastName: true, email: true,
                    role: true, avatar: true, designation: true, department: true,
                },
            },
        },
        orderBy: { joinedAt: 'asc' },
    });
};
exports.getProjectMembers = getProjectMembers;
const updateProjectMemberRole = async (projectId, userId, newRole) => {
    return database_1.default.projectMember.update({
        where: { userId_projectId: { userId, projectId } },
        data: { role: newRole },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
    });
};
exports.updateProjectMemberRole = updateProjectMemberRole;
const getProjectTimeSummary = async (projectId) => {
    const timeLogs = await database_1.default.timeLog.findMany({
        where: { task: { projectId } },
        include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            task: { select: { id: true, title: true } },
        },
    });
    const totalHours = timeLogs.reduce((s, l) => s + l.hours, 0);
    // Group by user
    const byUser = {};
    timeLogs.forEach(l => {
        const key = l.user.id;
        if (!byUser[key])
            byUser[key] = { name: `${l.user.firstName} ${l.user.lastName}`, hours: 0 };
        byUser[key].hours += l.hours;
    });
    // Group by task
    const byTask = {};
    timeLogs.forEach(l => {
        const key = l.task.id;
        if (!byTask[key])
            byTask[key] = { title: l.task.title, hours: 0 };
        byTask[key].hours += l.hours;
    });
    return {
        totalHours: Math.round(totalHours * 10) / 10,
        byUser: Object.values(byUser).sort((a, b) => b.hours - a.hours),
        byTask: Object.values(byTask).sort((a, b) => b.hours - a.hours),
        totalEntries: timeLogs.length,
    };
};
exports.getProjectTimeSummary = getProjectTimeSummary;
const submitForCompletion = async (projectId, userId) => {
    const project = await database_1.default.project.findUnique({ where: { id: projectId }, include: { members: true } });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    if (!project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
        throw new AppError_1.ForbiddenError('Only the project manager can submit for completion');
    }
    return database_1.default.project.update({ where: { id: projectId }, data: { status: 'PENDING_APPROVAL' } });
};
exports.submitForCompletion = submitForCompletion;
const approveCompletion = async (projectId) => {
    return database_1.default.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED', completedAt: new Date() },
    });
};
exports.approveCompletion = approveCompletion;
const rejectCompletion = async (projectId, reason) => {
    return database_1.default.project.update({
        where: { id: projectId },
        data: { status: 'ACTIVE' },
    });
};
exports.rejectCompletion = rejectCompletion;
//# sourceMappingURL=project.service.js.map