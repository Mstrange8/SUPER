import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/create-checkout-session', DonationController.createCheckoutSession);
router.post('/webhook', DonationController.handleWebhook); // Stripe webhook
router.get('/session/:sessionId', DonationController.getDonationBySession);

// Admin routes
router.get('/', authenticate, requireAdmin, DonationController.getAllDonations);
router.get('/stats', authenticate, requireAdmin, DonationController.getStats);

export default router;
