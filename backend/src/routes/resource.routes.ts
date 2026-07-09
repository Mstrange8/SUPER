import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes - anyone can view resources
router.get('/', ResourceController.getAllResources);
router.get('/search', ResourceController.searchResources);
router.get('/type/:type', ResourceController.getResourcesByType);
router.get('/:id', ResourceController.getResourceById);

// Protected routes - admin only
router.post('/', authenticate, requireAdmin, ResourceController.createResource);
router.patch('/:id', authenticate, requireAdmin, ResourceController.updateResource);
router.delete('/:id', authenticate, requireAdmin, ResourceController.deleteResource);

export default router;
