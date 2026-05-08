// ============================================
// Auth Module — Routes
// ============================================

import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { adminOrAbove } from '../../middleware/authorize';
import { loginValidation, registerValidation, handleValidationErrors } from '../../middleware/validate';

const router = Router();

// Public
router.post('/setup', authController.setup);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected
router.post('/register', authenticate, adminOrAbove, registerValidation, handleValidationErrors, authController.register);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
