import { Router } from 'express';
import { CourtController } from '../controllers/court.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
});

const router = Router();

// Public routes - anyone can view courts
router.get('/', CourtController.getAllCourts);
router.get('/search', CourtController.searchCourts);
router.get('/:id', CourtController.getCourtById);

// Protected routes - admin only
router.post('/', authenticate, requireAdmin, upload.single('image'), CourtController.createCourt);
router.patch('/:id', authenticate, requireAdmin, upload.single('image'), CourtController.updateCourt);
router.delete('/:id', authenticate, requireAdmin, CourtController.deleteCourt);

export default router;
