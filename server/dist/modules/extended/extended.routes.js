"use strict";
// ============================================
// Boards, Documents, Automation, Attachments, SavedViews
// All remaining API modules
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
exports.exportRoutes = exports.permissionRoutes = exports.automationRoutes = exports.documentRoutes = exports.viewRoutes = exports.approvalRoutes = exports.attachmentRoutes = exports.boardRoutes = void 0;
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const upload_1 = require("../../middleware/upload");
// ─── BOARDS ────────────────
exports.boardRoutes = (0, express_1.Router)();
exports.boardRoutes.use(auth_1.authenticate);
exports.boardRoutes.get('/project/:projectId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const boards = await database_1.default.board.findMany({
        where: { projectId: (0, params_1.p)(req.params.projectId) },
        include: { columns: { orderBy: { position: 'asc' }, include: { _count: { select: { tasks: true } } } } },
    });
    (0, apiResponse_1.sendResponse)({ res, data: boards });
}));
exports.boardRoutes.post('/', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const board = await database_1.default.board.create({
        data: {
            name: req.body.name || 'Board',
            projectId: req.body.projectId,
            columns: {
                createMany: {
                    data: req.body.columns || [
                        { name: 'To Do', color: '#636E72', position: 0, taskStatus: 'TODO' },
                        { name: 'In Progress', color: '#6C5CE7', position: 1, taskStatus: 'IN_PROGRESS' },
                        { name: 'In Review', color: '#F39C12', position: 2, taskStatus: 'IN_REVIEW' },
                        { name: 'Done', color: '#00B894', position: 3, taskStatus: 'DONE' },
                    ],
                },
            },
        },
        include: { columns: { orderBy: { position: 'asc' } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: board });
}));
exports.boardRoutes.patch('/columns/:columnId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const col = await database_1.default.boardColumn.update({ where: { id: (0, params_1.p)(req.params.columnId) }, data: req.body });
    (0, apiResponse_1.sendResponse)({ res, data: col });
}));
exports.boardRoutes.post('/columns', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const col = await database_1.default.boardColumn.create({ data: req.body });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: col });
}));
exports.boardRoutes.delete('/columns/:columnId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.boardColumn.delete({ where: { id: (0, params_1.p)(req.params.columnId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Column deleted' });
}));
// ─── TASK ATTACHMENTS ────────────────
exports.attachmentRoutes = (0, express_1.Router)();
exports.attachmentRoutes.use(auth_1.authenticate);
exports.attachmentRoutes.get('/task/:taskId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const attachments = await database_1.default.taskAttachment.findMany({
        where: { taskId: (0, params_1.p)(req.params.taskId) },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: attachments });
}));
exports.attachmentRoutes.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const attachment = await database_1.default.taskAttachment.create({
        data: {
            fileName: req.body.fileName,
            fileUrl: req.body.fileUrl,
            fileType: req.body.fileType || 'application/octet-stream',
            fileSize: req.body.fileSize || 0,
            taskId: req.body.taskId,
            uploadedBy: user.userId,
        },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: attachment });
}));
// File upload with multer
exports.attachmentRoutes.post('/upload', upload_1.uploadSingle, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const file = req.file;
    if (!file) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 400, message: 'No file uploaded' });
        return;
    }
    const attachment = await database_1.default.taskAttachment.create({
        data: {
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            fileSize: file.size,
            taskId: req.body.taskId,
            uploadedBy: user.userId,
        },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: attachment });
}));
exports.attachmentRoutes.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.taskAttachment.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Attachment deleted' });
}));
// ─── PROJECT APPROVAL WORKFLOW ────────────────
exports.approvalRoutes = (0, express_1.Router)();
exports.approvalRoutes.use(auth_1.authenticate);
// Manager submits project for completion approval
exports.approvalRoutes.post('/submit/:projectId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = await database_1.default.project.update({
        where: { id: (0, params_1.p)(req.params.projectId) },
        data: { status: 'PENDING_APPROVAL' },
    });
    // Notify founders
    const founders = await database_1.default.user.findMany({ where: { role: 'FOUNDER', organizationId: req.user.organizationId } });
    for (const f of founders) {
        await database_1.default.notification.create({
            data: { userId: f.id, title: 'Project Approval Request', message: `Project "${project.name}" submitted for completion approval`, type: 'PROJECT_APPROVAL', link: `/projects/${project.id}` },
        });
    }
    const io = req.app.get('io');
    if (io)
        founders.forEach(f => io.to(f.id).emit('notification:created'));
    (0, apiResponse_1.sendResponse)({ res, message: 'Submitted for approval', data: project });
}));
// Founder approves project
exports.approvalRoutes.post('/approve/:projectId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (user.role !== 'FOUNDER') {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 403, message: 'Only Founder can approve' });
        return;
    }
    const project = await database_1.default.project.update({
        where: { id: (0, params_1.p)(req.params.projectId) },
        data: { status: 'COMPLETED', completedAt: new Date() },
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Project approved', data: project });
}));
// Founder rejects project
exports.approvalRoutes.post('/reject/:projectId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (user.role !== 'FOUNDER') {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 403, message: 'Only Founder can reject' });
        return;
    }
    const project = await database_1.default.project.update({
        where: { id: (0, params_1.p)(req.params.projectId) },
        data: { status: 'ACTIVE' },
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Project rejected, returned to active', data: project });
}));
// Get pending approvals
exports.approvalRoutes.get('/pending', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const projects = await database_1.default.project.findMany({
        where: { organizationId: user.organizationId, status: 'PENDING_APPROVAL' },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { tasks: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, data: projects });
}));
// ─── SAVED VIEWS ────────────────
exports.viewRoutes = (0, express_1.Router)();
exports.viewRoutes.use(auth_1.authenticate);
exports.viewRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = { userId: user.userId };
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    const views = await database_1.default.savedView.findMany({ where, orderBy: { createdAt: 'desc' } });
    (0, apiResponse_1.sendResponse)({ res, data: views });
}));
exports.viewRoutes.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const view = await database_1.default.savedView.create({
        data: { ...req.body, userId: user.userId },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: view });
}));
exports.viewRoutes.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const view = await database_1.default.savedView.update({ where: { id: (0, params_1.p)(req.params.id) }, data: req.body });
    (0, apiResponse_1.sendResponse)({ res, data: view });
}));
exports.viewRoutes.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.savedView.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'View deleted' });
}));
// ─── DOCUMENTS (Notion-style) ────────────────
exports.documentRoutes = (0, express_1.Router)();
exports.documentRoutes.use(auth_1.authenticate);
exports.documentRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = {};
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    else
        where.createdById = user.userId;
    if (req.query.parentId)
        where.parentId = req.query.parentId;
    else if (!req.query.all)
        where.parentId = null; // top-level only by default
    const pages = await database_1.default.documentPage.findMany({
        where, orderBy: { updatedAt: 'desc' },
        include: {
            createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            project: { select: { id: true, name: true } },
            _count: { select: { children: true, blocks: true } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, data: pages });
}));
exports.documentRoutes.get('/:pageId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = await database_1.default.documentPage.findUnique({
        where: { id: (0, params_1.p)(req.params.pageId) },
        include: {
            createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            project: { select: { id: true, name: true } },
            blocks: { orderBy: { position: 'asc' } },
            children: {
                select: { id: true, title: true, icon: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' },
            },
        },
    });
    if (!page) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 404, message: 'Page not found' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, data: page });
}));
exports.documentRoutes.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const page = await database_1.default.documentPage.create({
        data: {
            title: req.body.title || 'Untitled',
            icon: req.body.icon,
            coverImage: req.body.coverImage,
            projectId: req.body.projectId,
            parentId: req.body.parentId,
            createdById: user.userId,
        },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: page });
}));
exports.documentRoutes.patch('/:pageId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.title !== undefined)
        data.title = req.body.title;
    if (req.body.icon !== undefined)
        data.icon = req.body.icon;
    if (req.body.coverImage !== undefined)
        data.coverImage = req.body.coverImage;
    if (req.body.isPublished !== undefined)
        data.isPublished = req.body.isPublished;
    const page = await database_1.default.documentPage.update({ where: { id: (0, params_1.p)(req.params.pageId) }, data });
    (0, apiResponse_1.sendResponse)({ res, data: page });
}));
exports.documentRoutes.delete('/:pageId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.documentPage.delete({ where: { id: (0, params_1.p)(req.params.pageId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Page deleted' });
}));
// Document Blocks
exports.documentRoutes.post('/:pageId/blocks', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const block = await database_1.default.documentBlock.create({
        data: {
            type: req.body.type || 'PARAGRAPH',
            content: req.body.content || {},
            position: req.body.position || 0,
            pageId: (0, params_1.p)(req.params.pageId),
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: block });
}));
exports.documentRoutes.patch('/blocks/:blockId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const block = await database_1.default.documentBlock.update({
        where: { id: (0, params_1.p)(req.params.blockId) }, data: req.body,
    });
    (0, apiResponse_1.sendResponse)({ res, data: block });
}));
exports.documentRoutes.delete('/blocks/:blockId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.documentBlock.delete({ where: { id: (0, params_1.p)(req.params.blockId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Block deleted' });
}));
// Batch update blocks (reorder/bulk edit)
exports.documentRoutes.put('/:pageId/blocks', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pageId = (0, params_1.p)(req.params.pageId);
    const blocks = req.body.blocks || [];
    // Delete existing and re-create (simple approach)
    await database_1.default.documentBlock.deleteMany({ where: { pageId } });
    if (blocks.length > 0) {
        await database_1.default.documentBlock.createMany({
            data: blocks.map((b, i) => ({
                type: b.type || 'PARAGRAPH', content: b.content || {}, position: i, pageId,
            })),
        });
    }
    const updated = await database_1.default.documentBlock.findMany({ where: { pageId }, orderBy: { position: 'asc' } });
    (0, apiResponse_1.sendResponse)({ res, data: updated });
}));
// ─── AUTOMATION RULES ────────────────
exports.automationRoutes = (0, express_1.Router)();
exports.automationRoutes.use(auth_1.authenticate);
exports.automationRoutes.use(authorize_1.adminOrAbove);
exports.automationRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = { organizationId: user.organizationId };
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    if (req.query.isActive !== undefined)
        where.isActive = req.query.isActive === 'true';
    const rules = await database_1.default.automationRule.findMany({
        where, orderBy: { createdAt: 'desc' },
        include: {
            project: { select: { id: true, name: true } },
            _count: { select: { executions: true } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, data: rules });
}));
exports.automationRoutes.get('/:ruleId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rule = await database_1.default.automationRule.findUnique({
        where: { id: (0, params_1.p)(req.params.ruleId) },
        include: {
            project: { select: { id: true, name: true } },
            executions: { take: 20, orderBy: { executedAt: 'desc' } },
        },
    });
    (0, apiResponse_1.sendResponse)({ res, data: rule });
}));
exports.automationRoutes.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const rule = await database_1.default.automationRule.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            trigger: req.body.trigger,
            triggerConfig: req.body.triggerConfig,
            conditions: req.body.conditions,
            actions: req.body.actions,
            projectId: req.body.projectId,
            organizationId: user.organizationId,
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: rule });
}));
exports.automationRoutes.patch('/:ruleId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.description !== undefined)
        data.description = req.body.description;
    if (req.body.isActive !== undefined)
        data.isActive = req.body.isActive;
    if (req.body.trigger !== undefined)
        data.trigger = req.body.trigger;
    if (req.body.triggerConfig !== undefined)
        data.triggerConfig = req.body.triggerConfig;
    if (req.body.conditions !== undefined)
        data.conditions = req.body.conditions;
    if (req.body.actions !== undefined)
        data.actions = req.body.actions;
    const rule = await database_1.default.automationRule.update({ where: { id: (0, params_1.p)(req.params.ruleId) }, data });
    (0, apiResponse_1.sendResponse)({ res, data: rule });
}));
exports.automationRoutes.delete('/:ruleId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.automationRule.delete({ where: { id: (0, params_1.p)(req.params.ruleId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Automation rule deleted' });
}));
// Execution log
exports.automationRoutes.get('/:ruleId/executions', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const executions = await database_1.default.automationExecution.findMany({
        where: { ruleId: (0, params_1.p)(req.params.ruleId) },
        orderBy: { executedAt: 'desc' }, take: 50,
    });
    (0, apiResponse_1.sendResponse)({ res, data: executions });
}));
// ─── PERMISSIONS (Granular RBAC) ────────────────
exports.permissionRoutes = (0, express_1.Router)();
exports.permissionRoutes.use(auth_1.authenticate);
exports.permissionRoutes.use(authorize_1.adminOrAbove);
exports.permissionRoutes.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const permissions = await database_1.default.permission.findMany({
        orderBy: { category: 'asc' },
        include: { rolePermissions: true },
    });
    (0, apiResponse_1.sendResponse)({ res, data: permissions });
}));
exports.permissionRoutes.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const perm = await database_1.default.permission.create({
        data: { name: req.body.name, description: req.body.description, category: req.body.category },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: perm });
}));
exports.permissionRoutes.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.permission.delete({ where: { id: (0, params_1.p)(req.params.id) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Permission deleted' });
}));
// Role-Permission matrix
exports.permissionRoutes.get('/matrix', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const permissions = await database_1.default.permission.findMany({ orderBy: { category: 'asc' } });
    const rolePerms = await database_1.default.rolePermission.findMany();
    const roles = ['FOUNDER', 'ADMIN', 'MANAGER', 'DEVELOPER'];
    const matrix = permissions.map(p => ({
        ...p,
        roles: Object.fromEntries(roles.map(r => [r, rolePerms.some(rp => rp.permissionId === p.id && rp.role === r)])),
    }));
    (0, apiResponse_1.sendResponse)({ res, data: matrix });
}));
exports.permissionRoutes.post('/assign', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { role, permissionId } = req.body;
    const rp = await database_1.default.rolePermission.create({ data: { role, permissionId } });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: rp });
}));
exports.permissionRoutes.delete('/revoke', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { role, permissionId } = req.body;
    await database_1.default.rolePermission.deleteMany({ where: { role, permissionId } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Permission revoked' });
}));
// CSV export endpoint for activity logs
exports.exportRoutes = (0, express_1.Router)();
exports.exportRoutes.use(auth_1.authenticate);
exports.exportRoutes.get('/activity-csv', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const where = {};
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    if (user.role !== 'FOUNDER' && user.role !== 'ADMIN')
        where.userId = user.userId;
    const logs = await database_1.default.activityLog.findMany({
        where, orderBy: { createdAt: 'desc' }, take: 1000,
        include: { user: { select: { firstName: true, lastName: true, email: true } }, project: { select: { name: true } } },
    });
    const csv = ['Date,User,Email,Action,Entity,Project']
        .concat(logs.map(l => `${l.createdAt.toISOString()},${l.user.firstName} ${l.user.lastName},${l.user.email},${l.action},${l.entityType},${l.project?.name || ''}`)).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity_log.csv');
    res.send(csv);
}));
exports.exportRoutes.get('/tasks-csv', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const where = {};
    if (req.query.projectId)
        where.projectId = req.query.projectId;
    const tasks = await database_1.default.task.findMany({
        where, orderBy: { createdAt: 'desc' },
        include: { project: { select: { name: true } }, assignments: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    const csv = ['Title,Status,Priority,Project,Assignees,Due Date,Story Points']
        .concat(tasks.map(t => `"${t.title}",${t.status},${t.priority},${t.project.name},"${t.assignments.map(a => `${a.user.firstName} ${a.user.lastName}`).join('; ')}",${t.dueDate?.toISOString() || ''},${t.storyPoints || ''}`)).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csv);
}));
exports.exportRoutes.get('/time-logs-csv', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const logs = await database_1.default.timeLog.findMany({
        orderBy: { logDate: 'desc' }, take: 1000,
        include: { user: { select: { firstName: true, lastName: true } }, task: { select: { title: true }, include: { project: { select: { name: true } } } } },
    });
    const csv = ['Date,User,Task,Project,Hours,Description']
        .concat(logs.map(l => `${l.logDate.toISOString()},${l.user.firstName} ${l.user.lastName},"${l.task.title}",${l.task.project.name},${l.hours},"${l.description || ''}"`)).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=time_logs.csv');
    res.send(csv);
}));
exports.exportRoutes.get('/report-pdf', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const PDFDocument = (await Promise.resolve().then(() => __importStar(require('pdfkit')))).default;
    const user = req.user;
    const [projects, taskStats] = await Promise.all([
        database_1.default.project.findMany({ where: { organizationId: user.organizationId }, include: { _count: { select: { tasks: true } } } }),
        database_1.default.task.groupBy({ by: ['status'], _count: { status: true } }),
    ]);
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=project_report.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Project Management Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).text('Task Summary');
    doc.moveDown(0.5);
    taskStats.forEach(s => {
        doc.fontSize(11).text(`  ${s.status}: ${s._count.status} tasks`);
    });
    doc.moveDown();
    doc.fontSize(14).text('Projects');
    doc.moveDown(0.5);
    projects.forEach(p => {
        doc.fontSize(11).text(`  ${p.name} — ${p.status} (${p._count.tasks} tasks)`);
    });
    doc.end();
}));
//# sourceMappingURL=extended.routes.js.map