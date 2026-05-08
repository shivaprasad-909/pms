import { Router } from 'express';
import * as taskController from './task.controller';
import { authenticate } from '../../middleware/auth';
import { managerOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', taskController.getAll);
router.post('/', managerOrAbove, taskController.create);
router.get('/:taskId', taskController.getById);
router.patch('/:taskId', taskController.update);
router.delete('/:taskId', managerOrAbove, taskController.remove);

// Reorder (Kanban drag-drop)
router.patch('/:taskId/reorder', taskController.reorder);

// Assignments
router.post('/:taskId/assign', managerOrAbove, taskController.assign);
router.delete('/:taskId/assign/:userId', managerOrAbove, taskController.unassign);

// Comments
router.get('/:taskId/comments', taskController.listComments);
router.post('/:taskId/comments', taskController.addComment);
router.patch('/:taskId/comments/:commentId', taskController.updateComment);
router.delete('/:taskId/comments/:commentId', taskController.deleteComment);

// Dependencies
router.get('/:taskId/dependencies', taskController.listDependencies);
router.post('/:taskId/dependencies', managerOrAbove, taskController.addDependency);
router.delete('/:taskId/dependencies/:dependencyId', managerOrAbove, taskController.removeDependency);

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

export default router;
