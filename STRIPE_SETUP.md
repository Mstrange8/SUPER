# Stripe Integration Setup Guide

This guide explains how to set up Stripe for accepting donations on the Sanpete Pickleball website.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Backend server running
- Access to Stripe Dashboard

## Step 1: Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
5. Add these to your `.env` file:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 2: Set Up Webhook Endpoint

Webhooks allow Stripe to notify your server when payments complete.

### Local Development (using Stripe CLI):

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/donations/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Production Setup:

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/donations/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copy the **Signing secret** and add to production `.env`

## Step 3: Test the Integration

### Using Test Cards:

Stripe provides test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiration date, any 3-digit CVC, and any postal code.

### Testing Flow:

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the Stripe webhook listener (in another terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/donations/webhook
   ```

3. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Navigate to `http://localhost:5173/donate`
5. Fill in a donation amount
6. Use a test card to complete payment
7. You should be redirected to the success page
8. Check the webhook listener terminal to see the `checkout.session.completed` event

## Step 4: Verify Database Records

After a successful test donation:

```bash
psql -d sanpete_pickleball -c "SELECT * FROM donations;"
```

You should see the donation record with status `completed`.

## API Endpoints

### Public Endpoints

- **POST** `/api/donations/create-checkout-session`
  - Creates a Stripe Checkout session
  - Body: `{ amount, currency, donorName, donorEmail, message }`
  - Returns: `{ sessionId, url }`

- **POST** `/api/donations/webhook`
  - Stripe webhook handler
  - Requires Stripe signature header
  - Updates donation status based on events

- **GET** `/api/donations/session/:sessionId`
  - Get donation details by Stripe session ID
  - Used on success page to display donation info

### Admin Endpoints (require authentication)

- **GET** `/api/donations`
  - Get all donations (paginated)
  - Query params: `limit`, `offset`

- **GET** `/api/donations/stats`
  - Get donation statistics
  - Returns: `{ totalAmount, totalDonations, completedAmount, completedCount }`

## Going Live

When ready for production:

1. Switch to live mode in Stripe Dashboard
2. Get live API keys (`pk_live_...` and `sk_live_...`)
3. Update production environment variables
4. Set up production webhook endpoint
5. Test with real payment methods (use small amounts)
6. Monitor Stripe Dashboard for transactions

## Security Notes

- **Never commit** `.env` files to version control
- Use environment variables for all sensitive keys
- Webhook endpoints must verify Stripe signatures
- HTTPS is required for production webhooks
- Keep Stripe SDK up to date

## Troubleshooting

### Webhook not receiving events:

- Verify webhook URL is correct
- Check webhook signing secret matches `.env`
- Ensure raw body parser is enabled for webhook route
- Check Stripe CLI is running (for local development)

### Payment not completing:

- Check browser console for errors
- Verify Stripe publishable key in frontend
- Check backend logs for API errors
- Verify redirect URLs are correct

### Database not updating:

- Check webhook events in Stripe Dashboard
- Verify webhook handler is processing events
- Check database connection
- Review backend logs for errors

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe CLI Docs: https://stripe.com/docs/stripe-cli

## Donation Amounts

- Minimum: $1.00 (100 cents)
- Maximum: $10,000 (1,000,000 cents)
- All amounts stored in cents to avoid floating-point issues
- Currency defaults to USD

## Receipt Emails

Stripe automatically sends receipt emails if:
- `donorEmail` is provided in the donation request
- Email receipts are enabled in Stripe Dashboard settings
