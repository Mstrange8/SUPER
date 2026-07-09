import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { DonationModel } from '../models/donation.model';
import type { DonationRequest } from '../types/donation.types';
import { config } from '../config';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2026-06-24.dahlia' as any,
});

export class DonationController {
  // Create a Stripe Checkout session for donation
  static async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency = 'usd', donorName, donorEmail, message }: DonationRequest = req.body;

      // Validate amount
      if (!amount || amount < 100) {
        res.status(400).json({ error: 'Amount must be at least $1.00 (100 cents)' });
        return;
      }

      if (amount > 1000000) {
        res.status(400).json({ error: 'Amount cannot exceed $10,000' });
        return;
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'Donation to Sanpete Pickleball Community',
                description: message || 'Support local pickleball events and courts',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${config.frontendUrl}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontendUrl}/donation-cancelled`,
        ...(donorEmail && { customer_email: donorEmail }),
        metadata: {
          donor_name: donorName || 'Anonymous',
          message: message || '',
        },
      });

      // Save donation record in database
      await DonationModel.create({
        stripe_session_id: session.id,
        amount,
        currency,
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        message: message || null,
        status: 'pending',
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create donation session' });
    }
  }

  // Webhook to handle Stripe events
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = config.stripe.webhookSecret;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await DonationModel.updateStatus(session.id, 'completed');
        console.log('Payment completed for session:', session.id);
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        await DonationModel.updateStatus(expiredSession.id, 'cancelled');
        console.log('Payment session expired:', expiredSession.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }

  // Get donation by session ID (for success page)
  static async getDonationBySession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId) 
        ? req.params.sessionId[0] 
        : req.params.sessionId;
      
      if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required' });
        return;
      }
      
      const donation = await DonationModel.findBySessionId(sessionId);

      if (!donation) {
        res.status(404).json({ error: 'Donation not found' });
        return;
      }

      res.json(donation);
    } catch (error) {
      console.error('Error fetching donation:', error);
      res.status(500).json({ error: 'Failed to fetch donation' });
    }
  }

  // Get all donations (admin only)
  static async getAllDonations(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await DonationModel.getAll(limit, offset);
      res.json({ ...result, limit, offset });
    } catch (error) {
      console.error('Error fetching donations:', error);
      res.status(500).json({ error: 'Failed to fetch donations' });
    }
  }

  // Get donation statistics (admin only)
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await DonationModel.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}
