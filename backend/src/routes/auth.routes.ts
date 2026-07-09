import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);

// Admin routes
router.get('/users', authenticate, requireAdmin, AuthController.getAllUsers);
router.patch('/users/:userId/role', authenticate, requireAdmin, AuthController.updateUserRole);

export default router;
