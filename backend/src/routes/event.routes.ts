import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes - anyone can view events
router.get('/', EventController.getAllEvents);
router.get('/search', EventController.searchEvents);
router.get('/date-range', EventController.getEventsByDateRange);
router.get('/type/:type', EventController.getEventsByType);
router.get('/:id', EventController.getEventById);

// Protected routes - admin only
router.post('/', authenticate, requireAdmin, EventController.createEvent);
router.patch('/:id', authenticate, requireAdmin, EventController.updateEvent);
router.delete('/:id', authenticate, requireAdmin, EventController.deleteEvent);

export default router;
