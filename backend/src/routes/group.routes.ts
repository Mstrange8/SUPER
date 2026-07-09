import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (can view groups without auth, but membership status only shown when authenticated)
router.get('/', GroupController.getAllGroups);
router.get('/search', GroupController.searchGroups);
router.get('/:id', GroupController.getGroupById);
router.get('/:id/members', GroupController.getGroupMembers);

// Authenticated routes (require login)
router.post('/', authenticate, GroupController.createGroup);
router.patch('/:id', authenticate, GroupController.updateGroup);
router.delete('/:id', authenticate, GroupController.deleteGroup);
router.post('/:id/join', authenticate, GroupController.joinGroup);
router.post('/:id/leave', authenticate, GroupController.leaveGroup);

export default router;
