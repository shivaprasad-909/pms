// ============================================
// Auth Module — Controller
// ============================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import * as authService from './auth.service';

export const setup = asyncHandler(async (req: Request, res: Response) => {
  const { organizationName, email, password, firstName, lastName } = req.body;
  const result = await authService.setupOrganization(organizationName, { email, password, firstName, lastName });
  sendResponse({ res, statusCode: 201, message: 'Organization created successfully', data: result });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await authService.registerUser({ ...req.body, organizationId: user.organizationId });
  sendResponse({ res, statusCode: 201, message: 'User registered successfully', data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  sendResponse({ res, message: 'Login successful', data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendResponse({ res, statusCode: 401, success: false, message: 'Refresh token is required' });
  }
  const result = await authService.refreshAccessToken(refreshToken);
  sendResponse({ res, message: 'Token refreshed', data: result });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await authService.logoutUser(user.userId);
  sendResponse({ res, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await authService.getCurrentUser(user.userId);
  sendResponse({ res, data: result });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  sendResponse({ res, message: 'If the email exists, a reset token has been generated', data: result });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  sendResponse({ res, message: 'Password has been reset successfully' });
});

