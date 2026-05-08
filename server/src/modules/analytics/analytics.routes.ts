import { Router } from 'express';
import * as ctrl from './analytics.controller';
import { authenticate } from '../../middleware/auth';
import { adminOrAbove, managerOrAbove, founderOnly } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

// Unified dashboard
router.get('/dashboard', ctrl.getDashboard);

// Founder/Admin analytics
router.get('/founder/overview', adminOrAbove, ctrl.getFounderOverview);
router.get('/founder/projects-completion-trend', adminOrAbove, ctrl.getProjectCompletionTrend);
router.get('/founder/team-workload', adminOrAbove, ctrl.getTeamWorkload);
router.get('/founder/sprint-velocity', adminOrAbove, ctrl.getSprintVelocity);
router.get('/founder/productivity', adminOrAbove, ctrl.getProductivity);
router.get('/founder/time-tracking-summary', adminOrAbove, ctrl.getTimeTrackingSummary);

// Manager analytics
router.get('/manager/burndown/:sprintId', managerOrAbove, ctrl.getProjectBurndown);
router.get('/manager/workload', managerOrAbove, ctrl.getManagerWorkload);
router.get('/manager/completion-trend', managerOrAbove, ctrl.getManagerCompletionTrend);

// Developer analytics
router.get('/developer/me', ctrl.getDeveloperOverview);
router.get('/developer/productivity', ctrl.getDeveloperProductivity);

// Advanced analytics (Admin+)
router.get('/resource-allocation', adminOrAbove, ctrl.getResourceAllocation);
router.get('/workload-heatmap', adminOrAbove, ctrl.getWorkloadHeatmap);
router.get('/capacity', adminOrAbove, ctrl.getCapacityAnalytics);

export default router;
