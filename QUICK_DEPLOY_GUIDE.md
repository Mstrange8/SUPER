# 🚀 Quick Deployment Guide - Sanpete Pickleball

## Current Status: Ready for Backend Deployment

✅ **Step 1: Database** - COMPLETE (Neon PostgreSQL migrated)
⏳ **Step 2: Frontend** - Deploy to Cloudflare Pages (in progress)
⏳ **Step 3: Backend** - Deploy to Cloudflare Workers (next)

---

## What You Need

Before starting backend deployment, make sure you have:
1. ✅ Your Neon database connection string
2. ⏳ Your frontend URL from Cloudflare Pages (after frontend deploys)
3. ✅ Your Stripe API keys (from Stripe dashboard)
4. 🔑 A JWT secret (we'll generate one)

---

## Backend Deployment - 5 Steps (15 minutes)

### Step 1: Generate JWT Secret
```bash
openssl rand -base64 32
```
Copy the output - you'll need it!

---

### Step 2: Login to Cloudflare
```bash
cd /Users/matthewstrange/GitHub/super/backend
wrangler login
```

---

### Step 3: Set Secrets (one by one)
```bash
wrangler secret put DATABASE_URL
# Paste your Neon connection string

wrangler secret put JWT_SECRET  
# Paste the random string from Step 1

wrangler secret put STRIPE_SECRET_KEY
# Paste from Stripe dashboard (starts with sk_)

wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste from Stripe dashboard (starts with whsec_)

wrangler secret put FRONTEND_URL
# Paste your Pages URL: https://your-site.pages.dev
```

---

### Step 4: Deploy!
```bash
npm run build
wrangler deploy
```

Save the Worker URL you get (like: https://sanpete-pickleball-api.xxx.workers.dev)

---

### Step 5: Update Frontend
Go to Cloudflare Dashboard → Pages → Settings → Environment Variables
- Add `VITE_API_URL` = Your Worker URL from Step 4
- Save and redeploy

---

## Test Your Deployment

1. Visit: `https://your-worker-url/api/health`
   - Should see: `{"status":"ok","message":"Server is running"}`

2. Visit your frontend: `https://your-site.pages.dev`
   - Try registering a new account
   - Try logging in
   - View events, courts, resources

---

## 🎉 Success!

If everything works, you've successfully deployed:
- ✅ Database (Neon PostgreSQL)
- ✅ Frontend (Cloudflare Pages)
- ✅ Backend (Cloudflare Workers)

**Total cost: $0/month** (on free tiers)

---

## Need Help?

Check these files:
- `BACKEND_DEPLOYMENT_CHECKLIST.md` - Detailed checklist
- `backend/DEPLOY.md` - Troubleshooting guide
- `DEPLOYMENT_GUIDE.md` - Complete documentation
