import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import * as taskService from './task.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await taskService.createTask(req.body, user.userId, user.role);
  // Emit real-time event
  const io = req.app.get('io');
  if (io) io.to(`project:${req.body.projectId}`).emit('task:created', result);
  sendResponse({ res, statusCode: 201, message: 'Task created', data: result });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await taskService.getTasks(req.query, user.userId, user.role);
  sendResponse({ res, data: result.tasks, pagination: result.pagination });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.getTaskById(p(req.params.taskId));
  sendResponse({ res, data: result });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await taskService.updateTask(p(req.params.taskId), req.body, user.userId, user.role);
  const io = req.app.get('io');
  if (io && result.projectId) io.to(`project:${result.projectId}`).emit('task:updated', result);
  sendResponse({ res, message: 'Task updated', data: result });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const io = req.app.get('io');
  const result = await taskService.deleteTask(p(req.params.taskId));
  if (io) io.emit('task:deleted', { taskId: req.params.taskId });
  sendResponse({ res, data: result });
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.assignTask(p(req.params.taskId), req.body.userId);
  sendResponse({ res, statusCode: 201, data: result });
});

export const unassign = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.unassignTask(p(req.params.taskId), p(req.params.userId));
  sendResponse({ res, data: result });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await taskService.addComment(p(req.params.taskId), user.userId, req.body.content, req.body.parentId);
  const io = req.app.get('io');
  if (io) io.emit('comment:added', { taskId: req.params.taskId, comment: result });
  sendResponse({ res, statusCode: 201, data: result });
});

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.reorderTask(p(req.params.taskId), req.body.position, req.body.status);
  sendResponse({ res, data: result });
});

export const addDependency = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.addDependency(p(req.params.taskId), req.body.dependencyTaskId);
  sendResponse({ res, statusCode: 201, data: result });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.getTaskStats(p(req.params.projectId));
  sendResponse({ res, data: result });
});

export const updateSubtask = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.updateSubtask(p(req.params.subtaskId), req.body);
  sendResponse({ res, data: result });
});

// --- Comments ---
export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listComments(p(req.params.taskId));
  sendResponse({ res, data: result });
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.updateComment(p(req.params.commentId), req.body.content);
  sendResponse({ res, message: 'Comment updated', data: result });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteComment(p(req.params.commentId));
  sendResponse({ res, message: 'Comment deleted' });
});

// --- Dependencies ---
export const listDependencies = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listDependencies(p(req.params.taskId));
  sendResponse({ res, data: result });
});

export const removeDependency = asyncHandler(async (req: Request, res: Response) => {
  await taskService.removeDependency(p(req.params.dependencyId));
  sendResponse({ res, message: 'Dependency removed' });
});

// --- Subtasks ---
export const listSubtasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listSubtasks(p(req.params.taskId));
  sendResponse({ res, data: result });
});

export const createSubtask = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.createSubtask(p(req.params.taskId), req.body);
  sendResponse({ res, statusCode: 201, data: result });
});

export const deleteSubtask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteSubtask(p(req.params.subtaskId));
  sendResponse({ res, message: 'Subtask deleted' });
});

// --- Time Logs for Task ---
export const listTimeLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listTimeLogs(p(req.params.taskId));
  sendResponse({ res, data: result });
});

export const createTimeLog = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await taskService.createTimeLog(p(req.params.taskId), user.userId, req.body);
  sendResponse({ res, statusCode: 201, data: result });
});

// --- Attachments for Task ---
export const listAttachments = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listAttachments(p(req.params.taskId));
  sendResponse({ res, data: result });
});

