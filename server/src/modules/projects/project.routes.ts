import { Router } from 'express';
import * as projectController from './project.controller';
import { authenticate } from '../../middleware/auth';
import { adminOrAbove, managerOrAbove, founderOnly } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', projectController.getAll);
router.post('/', adminOrAbove, projectController.create);
router.get('/:projectId', projectController.getById);
router.patch('/:projectId', managerOrAbove, projectController.update);
router.delete('/:projectId', adminOrAbove, projectController.remove);

// Members
router.get('/:projectId/members', projectController.getMembers);
router.post('/:projectId/members', managerOrAbove, projectController.addMember);
router.patch('/:projectId/members/:userId', managerOrAbove, projectController.updateMemberRole);
router.delete('/:projectId/members/:userId', managerOrAbove, projectController.removeMember);

// Time summary
router.get('/:projectId/time-summary', projectController.getTimeSummary);

// Completion workflow
router.post('/:projectId/submit-completion', projectController.submitCompletion);
router.post('/:projectId/approve-completion', founderOnly, projectController.approveCompletion);
router.post('/:projectId/reject-completion', founderOnly, projectController.rejectCompletion);

export default router;
