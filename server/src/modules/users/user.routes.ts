import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import * as userService from './user.service';
import { authenticate } from '../../middleware/auth';
import { adminOrAbove } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await userService.getUsers(user.organizationId, user.userId, user.role, req.query);
  sendResponse({ res, data: result.users, pagination: result.pagination });
}));

router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await userService.getUserById(user.userId);
  sendResponse({ res, data: result });
}));

router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserById(p(req.params.userId));
  sendResponse({ res, data: result });
}));

router.patch('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await userService.updateUser(p(req.params.userId), req.body, user.userId, user.role);
  sendResponse({ res, message: 'User updated', data: result });
}));

router.delete('/:userId', adminOrAbove, asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deactivateUser(p(req.params.userId));
  sendResponse({ res, message: 'User deactivated', data: result });
}));

router.get('/:userId/time-summary', asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserTimeSummary(p(req.params.userId), req.query);
  sendResponse({ res, data: result });
}));

export default router;
