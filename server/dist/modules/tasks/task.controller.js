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
exports.listAttachments = exports.createTimeLog = exports.listTimeLogs = exports.deleteSubtask = exports.createSubtask = exports.listSubtasks = exports.removeDependency = exports.listDependencies = exports.deleteComment = exports.updateComment = exports.listComments = exports.updateSubtask = exports.getStats = exports.addDependency = exports.reorder = exports.addComment = exports.unassign = exports.assign = exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const taskService = __importStar(require("./task.service"));
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await taskService.createTask(req.body, user.userId, user.role);
    // Emit real-time event
    const io = req.app.get('io');
    if (io)
        io.to(`project:${req.body.projectId}`).emit('task:created', result);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Task created', data: result });
});
exports.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await taskService.getTasks(req.query, user.userId, user.role);
    (0, apiResponse_1.sendResponse)({ res, data: result.tasks, pagination: result.pagination });
});
exports.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.getTaskById((0, params_1.p)(req.params.taskId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await taskService.updateTask((0, params_1.p)(req.params.taskId), req.body, user.userId, user.role);
    const io = req.app.get('io');
    if (io && result.projectId)
        io.to(`project:${result.projectId}`).emit('task:updated', result);
    (0, apiResponse_1.sendResponse)({ res, message: 'Task updated', data: result });
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const io = req.app.get('io');
    const result = await taskService.deleteTask((0, params_1.p)(req.params.taskId));
    if (io)
        io.emit('task:deleted', { taskId: req.params.taskId });
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.assign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.assignTask((0, params_1.p)(req.params.taskId), req.body.userId);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: result });
});
exports.unassign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.unassignTask((0, params_1.p)(req.params.taskId), (0, params_1.p)(req.params.userId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.addComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await taskService.addComment((0, params_1.p)(req.params.taskId), user.userId, req.body.content, req.body.parentId);
    const io = req.app.get('io');
    if (io)
        io.emit('comment:added', { taskId: req.params.taskId, comment: result });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: result });
});
exports.reorder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.reorderTask((0, params_1.p)(req.params.taskId), req.body.position, req.body.status);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.addDependency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.addDependency((0, params_1.p)(req.params.taskId), req.body.dependencyTaskId);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: result });
});
exports.getStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.getTaskStats((0, params_1.p)(req.params.projectId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.updateSubtask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.updateSubtask((0, params_1.p)(req.params.subtaskId), req.body);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
// --- Comments ---
exports.listComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.listComments((0, params_1.p)(req.params.taskId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.updateComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.updateComment((0, params_1.p)(req.params.commentId), req.body.content);
    (0, apiResponse_1.sendResponse)({ res, message: 'Comment updated', data: result });
});
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await taskService.deleteComment((0, params_1.p)(req.params.commentId));
    (0, apiResponse_1.sendResponse)({ res, message: 'Comment deleted' });
});
// --- Dependencies ---
exports.listDependencies = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.listDependencies((0, params_1.p)(req.params.taskId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.removeDependency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await taskService.removeDependency((0, params_1.p)(req.params.dependencyId));
    (0, apiResponse_1.sendResponse)({ res, message: 'Dependency removed' });
});
// --- Subtasks ---
exports.listSubtasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.listSubtasks((0, params_1.p)(req.params.taskId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.createSubtask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.createSubtask((0, params_1.p)(req.params.taskId), req.body);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: result });
});
exports.deleteSubtask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await taskService.deleteSubtask((0, params_1.p)(req.params.subtaskId));
    (0, apiResponse_1.sendResponse)({ res, message: 'Subtask deleted' });
});
// --- Time Logs for Task ---
exports.listTimeLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.listTimeLogs((0, params_1.p)(req.params.taskId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.createTimeLog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await taskService.createTimeLog((0, params_1.p)(req.params.taskId), user.userId, req.body);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: result });
});
// --- Attachments for Task ---
exports.listAttachments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await taskService.listAttachments((0, params_1.p)(req.params.taskId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
//# sourceMappingURL=task.controller.js.map