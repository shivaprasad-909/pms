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
const express_1 = require("express");
const taskController = __importStar(require("./task.controller"));
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', taskController.getAll);
router.post('/', authorize_1.managerOrAbove, taskController.create);
router.get('/:taskId', taskController.getById);
router.patch('/:taskId', taskController.update);
router.delete('/:taskId', authorize_1.managerOrAbove, taskController.remove);
// Reorder (Kanban drag-drop)
router.patch('/:taskId/reorder', taskController.reorder);
// Assignments
router.post('/:taskId/assign', authorize_1.managerOrAbove, taskController.assign);
router.delete('/:taskId/assign/:userId', authorize_1.managerOrAbove, taskController.unassign);
// Comments
router.get('/:taskId/comments', taskController.listComments);
router.post('/:taskId/comments', taskController.addComment);
router.patch('/:taskId/comments/:commentId', taskController.updateComment);
router.delete('/:taskId/comments/:commentId', taskController.deleteComment);
// Dependencies
router.get('/:taskId/dependencies', taskController.listDependencies);
router.post('/:taskId/dependencies', authorize_1.managerOrAbove, taskController.addDependency);
router.delete('/:taskId/dependencies/:dependencyId', authorize_1.managerOrAbove, taskController.removeDependency);
// Subtasks
router.get('/:taskId/subtasks', taskController.listSubtasks);
router.post('/:taskId/subtasks', taskController.createSubtask);
router.patch('/subtasks/:subtaskId', taskController.updateSubtask);
router.delete('/subtasks/:subtaskId', taskController.deleteSubtask);
// Time logs for task
router.get('/:taskId/time-logs', taskController.listTimeLogs);
router.post('/:taskId/time-logs', taskController.createTimeLog);
// Attachments for task
router.get('/:taskId/attachments', taskController.listAttachments);
// Stats
router.get('/stats/:projectId', taskController.getStats);
exports.default = router;
//# sourceMappingURL=task.routes.js.map