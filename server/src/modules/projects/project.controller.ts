import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import * as projectService from './project.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await projectService.createProject(req.body, user.userId, user.organizationId);
  sendResponse({ res, statusCode: 201, message: 'Project created', data: result });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await projectService.getProjects(user.userId, user.role, user.organizationId, req.query);
  sendResponse({ res, data: result.projects, pagination: result.pagination });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await projectService.getProjectById(p(req.params.projectId), user.userId, user.role);
  sendResponse({ res, data: result });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await projectService.updateProject(p(req.params.projectId), req.body, user.userId, user.role);
  sendResponse({ res, message: 'Project updated', data: result });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.deleteProject(p(req.params.projectId));
  sendResponse({ res, data: result });
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.addProjectMember(p(req.params.projectId), req.body.userId, req.body.role);
  sendResponse({ res, statusCode: 201, message: 'Member added', data: result });
});

export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.getProjectMembers(p(req.params.projectId));
  sendResponse({ res, data: result });
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.updateProjectMemberRole(p(req.params.projectId), p(req.params.userId), req.body.role);
  sendResponse({ res, message: 'Member role updated', data: result });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.removeProjectMember(p(req.params.projectId), p(req.params.userId));
  sendResponse({ res, data: result });
});

export const getTimeSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.getProjectTimeSummary(p(req.params.projectId));
  sendResponse({ res, data: result });
});

export const submitCompletion = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await projectService.submitForCompletion(p(req.params.projectId), user.userId);
  sendResponse({ res, message: 'Submitted for approval', data: result });
});

export const approveCompletion = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.approveCompletion(p(req.params.projectId));
  sendResponse({ res, message: 'Project approved', data: result });
});

export const rejectCompletion = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.rejectCompletion(p(req.params.projectId), req.body.reason);
  sendResponse({ res, message: 'Completion rejected', data: result });
});
