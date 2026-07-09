# Backend Deployment to Cloudflare Workers

## Step-by-Step Deployment Guide

### Step 1: Authenticate Wrangler CLI

Run this command to log in to your Cloudflare account:

```bash
cd /Users/matthewstrange/GitHub/super/backend
wrangler login
```

This will open your browser. Click "Allow" to authorize Wrangler.

---

### Step 2: Set Up Secrets

Your backend needs these secrets. Set them one by one:

```bash
# Database connection (use your Neon connection string)
wrangler secret put DATABASE_URL

# JWT secret (generate a random string)
wrangler secret put JWT_SECRET

# Stripe keys (from your Stripe dashboard)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Optional: Google Maps API key
wrangler secret put GOOGLE_MAPS_API_KEY
```

When prompted, paste/type the value for each secret.

**Example:**
```
$ wrangler secret put DATABASE_URL
Enter a secret value: › postgresql://your-neon-connection-string
✨ Success! Uploaded secret DATABASE_URL
```

---

### Step 3: Deploy the Worker

```bash
npm run build
wrangler deploy
```

You'll see output like:
```
✨ Built successfully
🌎 Uploading...
✨ Success! Deployed to:
   https://sanpete-pickleball-api.YOUR-SUBDOMAIN.workers.dev
```

**Copy this Worker URL** - you'll need it for the frontend!

---

### Step 4: Update Frontend Environment Variable

1. Go to your Cloudflare Pages deployment
2. Go to **Settings** → **Environment variables**
3. Add/Update:
   - Name: `VITE_API_URL`
   - Value: `https://sanpete-pickleball-api.YOUR-SUBDOMAIN.workers.dev`
4. Click **Save**
5. Trigger a new deployment (or push a commit)

---

### Step 5: Test Your Deployment

Visit your Worker URL:
```
https://sanpete-pickleball-api.YOUR-SUBDOMAIN.workers.dev/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## Troubleshooting

### Worker Deploy Fails
- Make sure all secrets are set: `wrangler secret list`
- Check wrangler.toml is correct
- Try: `wrangler deploy --compatibility-date=2024-01-01`

### CORS Errors
The backend needs to know your frontend URL. Set it as a secret:
```bash
wrangler secret put FRONTEND_URL
# Enter: https://sanpete-pickleball.pages.dev
```

Then redeploy: `wrangler deploy`

### Database Connection Issues
Make sure your DATABASE_URL includes `?sslmode=require` for Neon

---

## Quick Reference Commands

```bash
# Login
wrangler login

# List secrets
wrangler secret list

# Delete a secret (if you need to reset)
wrangler secret delete SECRET_NAME

# Deploy
wrangler deploy

# View logs
wrangler tail

# Deploy to development
wrangler deploy --env development
```

---

## What's Next?

After deployment:
1. ✅ Test the health endpoint
2. ✅ Test user registration/login
3. ✅ Test creating events (admin)
4. ✅ Test creating posts (user)
5. ✅ Test donation flow (Stripe)

Then you're ready for **Phase 10: Testing & Launch!** 🚀
