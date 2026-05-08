import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import * as analyticsService from './analytics.service';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getDashboardData(user.userId, user.role, user.organizationId);
  sendResponse({ res, data: result });
});

export const getFounderOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getFounderOverview(user.organizationId);
  sendResponse({ res, data: result });
});

export const getProjectCompletionTrend = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const months = parseInt(p(req.query.months as any) || '12');
  const result = await analyticsService.getProjectCompletionTrend(user.organizationId, months);
  sendResponse({ res, data: result });
});

export const getTeamWorkload = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getTeamWorkload(user.organizationId);
  sendResponse({ res, data: result });
});

export const getSprintVelocity = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const count = parseInt(p(req.query.count as any) || '8');
  const result = await analyticsService.getSprintVelocity(user.organizationId, count);
  sendResponse({ res, data: result });
});

export const getProductivity = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(p(req.query.days as any) || '30');
  const result = await analyticsService.getProductivity(user.organizationId, days);
  sendResponse({ res, data: result });
});

export const getTimeTrackingSummary = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getTimeTrackingSummary(user.organizationId);
  sendResponse({ res, data: result });
});

export const getProjectBurndown = asyncHandler(async (req: Request, res: Response) => {
  const result = await analyticsService.getProjectBurndown(p(req.params.sprintId));
  sendResponse({ res, data: result });
});

export const getDeveloperOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getDeveloperOverview(user.userId);
  sendResponse({ res, data: result });
});

export const getManagerWorkload = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getManagerWorkload(user.userId, user.organizationId);
  sendResponse({ res, data: result });
});

export const getManagerCompletionTrend = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const months = parseInt(p(req.query.months as any) || '6');
  const result = await analyticsService.getManagerCompletionTrend(user.userId, months);
  sendResponse({ res, data: result });
});

export const getDeveloperProductivity = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(p(req.query.days as any) || '30');
  const result = await analyticsService.getDeveloperProductivity(user.userId, days);
  sendResponse({ res, data: result });
});

export const getResourceAllocation = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getResourceAllocation(user.organizationId);
  sendResponse({ res, data: result });
});

export const getWorkloadHeatmap = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getWorkloadHeatmap(user.organizationId);
  sendResponse({ res, data: result });
});

export const getCapacityAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await analyticsService.getCapacityAnalytics(user.organizationId);
  sendResponse({ res, data: result });
});

