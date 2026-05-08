"use strict";
// ============================================
// Tasks Module — Service
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAttachments = exports.createTimeLog = exports.listTimeLogs = exports.deleteSubtask = exports.createSubtask = exports.listSubtasks = exports.removeDependency = exports.listDependencies = exports.deleteComment = exports.updateComment = exports.listComments = exports.getTaskStats = exports.updateSubtask = exports.addDependency = exports.reorderTask = exports.addComment = exports.unassignTask = exports.assignTask = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const database_1 = __importDefault(require("../../config/database"));
const AppError_1 = require("../../errors/AppError");
const createTask = async (input, userId, role) => {
    const project = await database_1.default.project.findUnique({
        where: { id: input.projectId }, include: { members: true },
    });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    if (role === 'MANAGER' && !project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
        throw new AppError_1.ForbiddenError('You can only create tasks in projects you manage');
    }
    const maxPos = await database_1.default.task.findFirst({
        where: { projectId: input.projectId }, orderBy: { position: 'desc' }, select: { position: true },
    });
    const task = await database_1.default.$transaction(async (tx) => {
        const newTask = await tx.task.create({
            data: {
                title: input.title,
                description: input.description,
                priority: input.priority || 'MEDIUM',
                estimatedHours: input.estimatedHours,
                storyPoints: input.storyPoints,
                dueDate: input.dueDate ? new Date(input.dueDate) : null,
                startDate: input.startDate ? new Date(input.startDate) : null,
                projectId: input.projectId,
                sprintId: input.sprintId || null,
                labels: input.labels || null,
                position: (maxPos?.position || 0) + 1,
            },
        });
        if (input.assigneeIds?.length > 0) {
            await tx.taskAssignment.createMany({
                data: input.assigneeIds.map((id) => ({ taskId: newTask.id, userId: id })),
            });
        }
        if (input.subtasks?.length > 0) {
            await tx.subtask.createMany({
                data: input.subtasks.map((s, i) => ({
                    taskId: newTask.id, title: s.title || s, position: i,
                })),
            });
        }
        return newTask;
    });
    return (0, exports.getTaskById)(task.id);
};
exports.createTask = createTask;
const getTasks = async (filters, userId, role) => {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;
    const where = {};
    if (filters.projectId)
        where.projectId = filters.projectId;
    if (filters.sprintId)
        where.sprintId = filters.sprintId;
    if (filters.status)
        where.status = filters.status;
    if (filters.priority)
        where.priority = filters.priority;
    if (role === 'DEVELOPER') {
        where.assignments = { some: { userId } };
    }
    else if (role === 'MANAGER') {
        where.project = { members: { some: { userId, role: 'MANAGER' } } };
    }
    if (filters.assigneeId) {
        where.assignments = { some: { userId: filters.assigneeId } };
    }
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.overdue === 'true') {
        where.dueDate = { lt: new Date() };
        where.status = { notIn: ['DONE'] };
    }
    const [tasks, total] = await Promise.all([
        database_1.default.task.findMany({
            where, skip, take: limit,
            orderBy: filters.sortBy ? { [filters.sortBy]: filters.sortOrder || 'asc' } : { position: 'asc' },
            include: {
                assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
                project: { select: { id: true, name: true, slug: true } },
                sprint: { select: { id: true, name: true, status: true } },
                subtasks: { orderBy: { position: 'asc' } },
                _count: { select: { comments: true, attachments: true, timeLogs: true, subtasks: true } },
            },
        }),
        database_1.default.task.count({ where }),
    ]);
    return { tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
exports.getTasks = getTasks;
const getTaskById = async (taskId) => {
    const task = await database_1.default.task.findUnique({
        where: { id: taskId },
        include: {
            project: { select: { id: true, name: true, slug: true } },
            sprint: { select: { id: true, name: true, status: true } },
            assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } } } },
            comments: {
                where: { parentId: null }, orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                    replies: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
                },
            },
            attachments: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
            timeLogs: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { logDate: 'desc' } },
            subtasks: { orderBy: { position: 'asc' } },
            dependencies: { include: { dependencyTask: { select: { id: true, title: true, status: true } } } },
            dependents: { include: { dependentTask: { select: { id: true, title: true, status: true } } } },
        },
    });
    if (!task)
        throw new AppError_1.NotFoundError('Task');
    return task;
};
exports.getTaskById = getTaskById;
const updateTask = async (taskId, input, userId, role) => {
    const task = await database_1.default.task.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } }, assignments: true },
    });
    if (!task)
        throw new AppError_1.NotFoundError('Task');
    if (role === 'DEVELOPER') {
        if (!task.assignments.some(a => a.userId === userId))
            throw new AppError_1.ForbiddenError('Not assigned to this task');
        const allowed = ['status'];
        if (Object.keys(input).some(k => !allowed.includes(k)))
            throw new AppError_1.ForbiddenError('Developers can only update task status');
    }
    if (role === 'MANAGER' && !task.project.members.some(m => m.userId === userId && m.role === 'MANAGER')) {
        throw new AppError_1.ForbiddenError('You can only update tasks in your projects');
    }
    const data = {};
    if (input.title)
        data.title = input.title;
    if (input.description !== undefined)
        data.description = input.description;
    if (input.status) {
        data.status = input.status;
        if (input.status === 'DONE') {
            data.completedAt = new Date();
            const totalH = await database_1.default.timeLog.aggregate({ where: { taskId }, _sum: { hours: true } });
            data.actualHours = totalH._sum.hours || 0;
        }
    }
    if (input.priority)
        data.priority = input.priority;
    if (input.estimatedHours !== undefined)
        data.estimatedHours = input.estimatedHours;
    if (input.storyPoints !== undefined)
        data.storyPoints = input.storyPoints;
    if (input.dueDate !== undefined)
        data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.startDate !== undefined)
        data.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.sprintId !== undefined)
        data.sprintId = input.sprintId || null;
    if (input.position !== undefined)
        data.position = input.position;
    if (input.labels !== undefined)
        data.labels = input.labels;
    return database_1.default.task.update({
        where: { id: taskId }, data,
        include: {
            assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
            project: { select: { id: true, name: true } },
            subtasks: { orderBy: { position: 'asc' } },
        },
    });
};
exports.updateTask = updateTask;
const deleteTask = async (taskId) => {
    const task = await database_1.default.task.findUnique({ where: { id: taskId } });
    if (!task)
        throw new AppError_1.NotFoundError('Task');
    await database_1.default.task.delete({ where: { id: taskId } });
    return { message: 'Task deleted' };
};
exports.deleteTask = deleteTask;
const assignTask = async (taskId, userId) => {
    return database_1.default.taskAssignment.create({
        data: { taskId, userId },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
};
exports.assignTask = assignTask;
const unassignTask = async (taskId, userId) => {
    await database_1.default.taskAssignment.delete({ where: { taskId_userId: { taskId, userId } } });
    return { message: 'Unassigned' };
};
exports.unassignTask = unassignTask;
const addComment = async (taskId, userId, content, parentId) => {
    return database_1.default.taskComment.create({
        data: { content, taskId, userId, parentId: parentId || null },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
};
exports.addComment = addComment;
const reorderTask = async (taskId, position, status) => {
    const data = { position };
    if (status) {
        data.status = status;
        if (status === 'DONE')
            data.completedAt = new Date();
    }
    return database_1.default.task.update({
        where: { id: taskId }, data,
        include: { assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } },
    });
};
exports.reorderTask = reorderTask;
const addDependency = async (dependentTaskId, dependencyTaskId) => {
    if (dependentTaskId === dependencyTaskId)
        throw new Error('Cannot depend on itself');
    return database_1.default.taskDependency.create({
        data: { dependentTaskId, dependencyTaskId },
        include: {
            dependentTask: { select: { id: true, title: true } },
            dependencyTask: { select: { id: true, title: true } },
        },
    });
};
exports.addDependency = addDependency;
const updateSubtask = async (subtaskId, data) => {
    return database_1.default.subtask.update({ where: { id: subtaskId }, data });
};
exports.updateSubtask = updateSubtask;
const getTaskStats = async (projectId) => {
    const [total, byStatus, byPriority, overdue] = await Promise.all([
        database_1.default.task.count({ where: { projectId } }),
        database_1.default.task.groupBy({ by: ['status'], where: { projectId }, _count: { status: true } }),
        database_1.default.task.groupBy({ by: ['priority'], where: { projectId }, _count: { priority: true } }),
        database_1.default.task.count({ where: { projectId, dueDate: { lt: new Date() }, status: { notIn: ['DONE'] } } }),
    ]);
    return {
        total, overdue,
        byStatus: byStatus.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {}),
        byPriority: byPriority.reduce((a, c) => ({ ...a, [c.priority]: c._count.priority }), {}),
    };
};
exports.getTaskStats = getTaskStats;
// ─── COMMENTS ────────────────
const listComments = async (taskId) => {
    return database_1.default.taskComment.findMany({
        where: { taskId, parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            replies: {
                include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
};
exports.listComments = listComments;
const updateComment = async (commentId, content) => {
    return database_1.default.taskComment.update({
        where: { id: commentId },
        data: { content },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
};
exports.updateComment = updateComment;
const deleteComment = async (commentId) => {
    await database_1.default.taskComment.delete({ where: { id: commentId } });
};
exports.deleteComment = deleteComment;
// ─── DEPENDENCIES ────────────────
const listDependencies = async (taskId) => {
    const [blocking, blockedBy] = await Promise.all([
        database_1.default.taskDependency.findMany({
            where: { dependencyTaskId: taskId },
            include: { dependentTask: { select: { id: true, title: true, status: true, priority: true } } },
        }),
        database_1.default.taskDependency.findMany({
            where: { dependentTaskId: taskId },
            include: { dependencyTask: { select: { id: true, title: true, status: true, priority: true } } },
        }),
    ]);
    return { blocking, blockedBy };
};
exports.listDependencies = listDependencies;
const removeDependency = async (dependencyId) => {
    await database_1.default.taskDependency.delete({ where: { id: dependencyId } });
};
exports.removeDependency = removeDependency;
// ─── SUBTASKS ────────────────
const listSubtasks = async (taskId) => {
    return database_1.default.subtask.findMany({
        where: { taskId },
        orderBy: { position: 'asc' },
    });
};
exports.listSubtasks = listSubtasks;
const createSubtask = async (taskId, data) => {
    const maxPos = await database_1.default.subtask.findFirst({
        where: { taskId }, orderBy: { position: 'desc' }, select: { position: true },
    });
    return database_1.default.subtask.create({
        data: {
            title: data.title,
            isCompleted: data.isCompleted || false,
            position: (maxPos?.position || 0) + 1,
            taskId,
        },
    });
};
exports.createSubtask = createSubtask;
const deleteSubtask = async (subtaskId) => {
    await database_1.default.subtask.delete({ where: { id: subtaskId } });
};
exports.deleteSubtask = deleteSubtask;
// ─── TIME LOGS ────────────────
const listTimeLogs = async (taskId) => {
    return database_1.default.timeLog.findMany({
        where: { taskId },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        orderBy: { logDate: 'desc' },
    });
};
exports.listTimeLogs = listTimeLogs;
const createTimeLog = async (taskId, userId, data) => {
    return database_1.default.timeLog.create({
        data: {
            hours: data.hours,
            description: data.description,
            logDate: new Date(data.logDate || new Date()),
            startTime: data.startTime ? new Date(data.startTime) : null,
            endTime: data.endTime ? new Date(data.endTime) : null,
            taskId,
            userId,
        },
        include: {
            task: { select: { id: true, title: true } },
            user: { select: { id: true, firstName: true, lastName: true } },
        },
    });
};
exports.createTimeLog = createTimeLog;
// ─── ATTACHMENTS ────────────────
const listAttachments = async (taskId) => {
    return database_1.default.taskAttachment.findMany({
        where: { taskId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.listAttachments = listAttachments;
//# sourceMappingURL=task.service.js.map