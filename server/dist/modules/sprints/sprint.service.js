"use strict";
// ============================================
// Sprints Module — Service + Controller + Routes
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
exports.swapSprint = exports.getSprintVelocity = exports.getSprintBurndown = exports.removeTaskFromSprint = exports.addTasksToSprint = exports.deleteSprint = exports.updateSprint = exports.getSprintById = exports.getSprints = exports.createSprint = void 0;
const database_1 = __importDefault(require("../../config/database"));
const AppError_1 = require("../../errors/AppError");
const createSprint = async (input) => {
    return database_1.default.sprint.create({
        data: {
            name: input.name, goal: input.goal,
            startDate: new Date(input.startDate), endDate: new Date(input.endDate),
            projectId: input.projectId,
        },
        include: { project: { select: { id: true, name: true } }, _count: { select: { tasks: true } } },
    });
};
exports.createSprint = createSprint;
const getSprints = async (filters) => {
    const where = {};
    if (filters.projectId)
        where.projectId = filters.projectId;
    if (filters.status)
        where.status = filters.status;
    return database_1.default.sprint.findMany({
        where, orderBy: { startDate: 'desc' },
        include: {
            project: { select: { id: true, name: true } },
            _count: { select: { tasks: true } },
            tasks: {
                select: { id: true, status: true, storyPoints: true },
            },
        },
    });
};
exports.getSprints = getSprints;
const getSprintById = async (id) => {
    const sprint = await database_1.default.sprint.findUnique({
        where: { id },
        include: {
            project: { select: { id: true, name: true } },
            tasks: {
                orderBy: { position: 'asc' },
                include: {
                    assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
                    _count: { select: { comments: true, subtasks: true } },
                },
            },
        },
    });
    if (!sprint)
        throw new AppError_1.NotFoundError('Sprint');
    // Compute analytics
    const analytics = {
        total: sprint.tasks.length,
        todo: sprint.tasks.filter(t => t.status === 'TODO').length,
        inProgress: sprint.tasks.filter(t => t.status === 'IN_PROGRESS').length,
        inReview: sprint.tasks.filter(t => t.status === 'IN_REVIEW').length,
        done: sprint.tasks.filter(t => t.status === 'DONE').length,
        blocked: sprint.tasks.filter(t => t.status === 'BLOCKED').length,
        totalPoints: sprint.tasks.reduce((s, t) => s + (t.storyPoints || 0), 0),
        completedPoints: sprint.tasks.filter(t => t.status === 'DONE').reduce((s, t) => s + (t.storyPoints || 0), 0),
    };
    return { ...sprint, analytics };
};
exports.getSprintById = getSprintById;
const updateSprint = async (id, data) => {
    const update = {};
    if (data.name)
        update.name = data.name;
    if (data.goal !== undefined)
        update.goal = data.goal;
    if (data.status)
        update.status = data.status;
    if (data.startDate)
        update.startDate = new Date(data.startDate);
    if (data.endDate)
        update.endDate = new Date(data.endDate);
    return database_1.default.sprint.update({ where: { id }, data: update });
};
exports.updateSprint = updateSprint;
const deleteSprint = async (id) => {
    await database_1.default.sprint.delete({ where: { id } });
    return { message: 'Sprint deleted' };
};
exports.deleteSprint = deleteSprint;
const addTasksToSprint = async (sprintId, taskIds) => {
    await database_1.default.task.updateMany({ where: { id: { in: taskIds } }, data: { sprintId } });
    return { message: `${taskIds.length} tasks added to sprint` };
};
exports.addTasksToSprint = addTasksToSprint;
const removeTaskFromSprint = async (sprintId, taskId) => {
    await database_1.default.task.update({ where: { id: taskId }, data: { sprintId: null } });
    return { message: 'Task removed from sprint' };
};
exports.removeTaskFromSprint = removeTaskFromSprint;
const getSprintBurndown = async (sprintId) => {
    const sprint = await database_1.default.sprint.findUnique({
        where: { id: sprintId },
        include: { tasks: { select: { storyPoints: true, status: true, completedAt: true, createdAt: true } } },
    });
    if (!sprint)
        return null;
    const dayjs = (await Promise.resolve().then(() => __importStar(require('dayjs')))).default;
    const totalPoints = sprint.tasks.reduce((s, t) => s + (t.storyPoints || 1), 0);
    const days = dayjs(sprint.endDate).diff(dayjs(sprint.startDate), 'day') + 1;
    const burndown = [];
    for (let i = 0; i < days; i++) {
        const d = dayjs(sprint.startDate).add(i, 'day');
        const completedByDay = sprint.tasks.filter(t => t.completedAt && dayjs(t.completedAt).isBefore(d.endOf('day'))).reduce((s, t) => s + (t.storyPoints || 1), 0);
        burndown.push({
            day: i + 1,
            date: d.format('MMM DD'),
            ideal: Math.round(totalPoints - (totalPoints / days) * (i + 1)),
            actual: d.isBefore(dayjs()) || d.isSame(dayjs(), 'day') ? totalPoints - completedByDay : 0,
        });
    }
    return { sprint: { id: sprint.id, name: sprint.name }, totalPoints, burndown };
};
exports.getSprintBurndown = getSprintBurndown;
const getSprintVelocity = async (sprintId) => {
    const sprint = await database_1.default.sprint.findUnique({
        where: { id: sprintId },
        include: {
            project: { select: { id: true, name: true } },
            tasks: { select: { storyPoints: true, status: true } },
        },
    });
    if (!sprint)
        return null;
    const completedPoints = sprint.tasks
        .filter(t => t.status === 'DONE')
        .reduce((s, t) => s + (t.storyPoints || 0), 0);
    const totalPoints = sprint.tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
    return {
        sprintId: sprint.id,
        name: sprint.name,
        project: sprint.project,
        completedPoints,
        totalPoints,
        completedTasks: sprint.tasks.filter(t => t.status === 'DONE').length,
        totalTasks: sprint.tasks.length,
        velocity: completedPoints,
    };
};
exports.getSprintVelocity = getSprintVelocity;
const swapSprint = async (fromSprintId, toSprintId) => {
    const incompleteTasks = await database_1.default.task.findMany({
        where: { sprintId: fromSprintId, status: { notIn: ['DONE'] } },
        select: { id: true },
    });
    await database_1.default.task.updateMany({
        where: { id: { in: incompleteTasks.map(t => t.id) } },
        data: { sprintId: toSprintId },
    });
    return { message: `${incompleteTasks.length} incomplete tasks moved to target sprint` };
};
exports.swapSprint = swapSprint;
//# sourceMappingURL=sprint.service.js.map