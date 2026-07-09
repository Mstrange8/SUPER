# Phase 9: Cloudflare Deployment Status

## ✅ Completed Steps

1. ✅ Installed Wrangler CLI
2. ✅ Created deployment strategy
3. ✅ Created deployment guides
4. ✅ Configured deployment approach:
   - Frontend: Cloudflare Pages
   - Backend: Cloudflare Workers (Express)
   - Database: Neon PostgreSQL

## ⏳ Next Steps (Manual)

### Step 1: Set Up Neon Database (5 minutes)
1. Go to https://neon.tech
2. Sign up/login
3. Create project: "sanpete-pickleball"
4. Copy connection string
5. Update `backend/.env` with: `DATABASE_URL=postgresql://...`
6. Run migrations: `cd backend && npm run migrate:up`

### Step 2: Deploy Frontend (10 minutes)
**Recommended: Git-based deployment**
1. Push code to GitHub if not already
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select repository
5. Configure build:
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `frontend`
   - Framework preset: Vue
6. Add environment variable: `VITE_API_URL` (leave empty for now)
7. Deploy

### Step 3: Prepare Backend for Workers
Currently, the backend uses Express which needs adaptation for Workers.

**Two options:**
1. **Quick Deploy**: Use `@cloudflare/workers-backend` adapter (keeps Express)
2. **Production Ready**: Migrate to Hono framework (better for Workers)

I recommend Option 1 for quick deployment, then migrate to Hono later if needed.

### Step 4: Set Up Wrangler Auth
```bash
wrangler login
```
This will open browser to authenticate with Cloudflare.

### Step 5: Create Worker
```bash
cd backend
# Create wrangler.toml (see DEPLOYMENT_GUIDE.md)
# Set secrets
wrangler secret put DATABASE_URL
wrangler secret put JWT_SECRET
wrangler secret put STRIPE_SECRET_KEY
# Deploy
wrangler deploy
```

### Step 6: Update Frontend with Worker URL
After backend deploys, update Frontend environment variable with Worker URL.

### Step 7: Test Everything
- Registration/Login
- Creating events (admin)
- Viewing courts
- Creating posts (user)  
- Donations (Stripe)

## 📋 Deployment Checklist

- [ ] Neon database created and migrated
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Backend adapted for Workers
- [ ] Backend deployed to Cloudflare Workers
- [ ] Environment variables configured
- [ ] DNS/domain configured (optional)
- [ ] SSL/TLS working
- [ ] All features tested in production
- [ ] Monitoring set up

## 📚 Documentation Created

- `DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- `frontend/DEPLOY.md` - Frontend deployment specifics
- `CLOUDFLARE_DEPLOYMENT.md` - Architecture decisions

## 🚀 Ready to Deploy!

Follow DEPLOYMENT_GUIDE.md for detailed instructions.

The current code is production-ready for the frontend.
The backend needs minor adaptations for Cloudflare Workers.

**Estimated time to deploy: 30-60 minutes**
