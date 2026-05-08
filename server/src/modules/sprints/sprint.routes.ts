import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import * as sprintService from './sprint.service';
import { authenticate } from '../../middleware/auth';
import { managerOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.getSprints(req.query);
  sendResponse({ res, data: result });
}));

router.post('/', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.createSprint(req.body);
  sendResponse({ res, statusCode: 201, data: result });
}));

router.get('/:sprintId', asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.getSprintById(p(req.params.sprintId));
  sendResponse({ res, data: result });
}));

router.patch('/:sprintId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.updateSprint(p(req.params.sprintId), req.body);
  sendResponse({ res, data: result });
}));

router.delete('/:sprintId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.deleteSprint(p(req.params.sprintId));
  sendResponse({ res, data: result });
}));

router.post('/:sprintId/tasks', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.addTasksToSprint(p(req.params.sprintId), req.body.taskIds);
  sendResponse({ res, data: result });
}));

router.delete('/:sprintId/tasks/:taskId', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.removeTaskFromSprint(p(req.params.sprintId), p(req.params.taskId));
  sendResponse({ res, data: result });
}));

// Burndown
router.get('/:sprintId/burndown', asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.getSprintBurndown(p(req.params.sprintId));
  sendResponse({ res, data: result });
}));

// Velocity
router.get('/:sprintId/velocity', asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.getSprintVelocity(p(req.params.sprintId));
  sendResponse({ res, data: result });
}));

// Swap sprint (move tasks between sprints)
router.post('/:sprintId/swap', managerOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await sprintService.swapSprint(p(req.params.sprintId), req.body.targetSprintId);
  sendResponse({ res, data: result });
}));

export default router;
