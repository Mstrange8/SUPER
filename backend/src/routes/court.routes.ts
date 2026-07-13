import { Router } from 'express';
import { CourtController } from '../controllers/court.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes - anyone can view courts
router.get('/', CourtController.getAllCourts);
router.get('/search', CourtController.searchCourts);
router.get('/:id', CourtController.getCourtById);

// Protected routes - admin only
router.post('/', authenticate, requireAdmin, CourtController.createCourt);
router.patch('/:id', authenticate, requireAdmin, CourtController.updateCourt);
router.delete('/:id', authenticate, requireAdmin, CourtController.deleteCourt);

export default router;
