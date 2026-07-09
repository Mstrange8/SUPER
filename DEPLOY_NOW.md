# 🚀 DEPLOY NOW - Immediate Actions

## Step 1: Frontend Deployment (10 minutes)

### A. Push to GitHub (if needed)
```bash
cd /Users/matthewstrange/GitHub/super
git add .
git commit -m "Ready for Cloudflare deployment"
git push origin main
```

### B. Deploy to Cloudflare Pages
1. Go to: **https://dash.cloudflare.com/**
2. Click **Pages** (left sidebar)
3. Click **Create a project**
4. Click **Connect to Git**
5. Select your repository: `super`
6. Click **Begin setup**

### C. Configure Build Settings
Enter these EXACT settings:

| Setting | Value |
|---------|-------|
| Project name | `sanpete-pickleball` |
| Production branch | `main` |
| Framework preset | `Vue` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `frontend` |

### D. Environment Variables
- Click **Add variable**
- Name: `VITE_API_URL`
- Value: Leave empty for now (we'll add after backend deploys)

### E. Deploy!
- Click **Save and Deploy**
- Wait 2-3 minutes
- **SAVE YOUR URL**: `https://________.pages.dev`

---

## Step 2: Backend Deployment (15 minutes)

### A. Generate JWT Secret
```bash
openssl rand -base64 32
```
**Copy the output!** You'll need it in the next step.

### B. Login to Cloudflare
```bash
cd /Users/matthewstrange/GitHub/super/backend
wrangler login
```
Browser will open - click "Allow"

### C. Set Secrets
Run these commands ONE BY ONE, pasting the value when prompted:

```bash
# 1. Database (your Neon connection string)
wrangler secret put DATABASE_URL

# 2. JWT Secret (paste the random string from Step A)
wrangler secret put JWT_SECRET

# 3. Stripe Secret Key (from Stripe dashboard)
wrangler secret put STRIPE_SECRET_KEY

# 4. Stripe Webhook Secret (from Stripe dashboard)
wrangler secret put STRIPE_WEBHOOK_SECRET

# 5. Frontend URL (your Pages URL from Step 1E)
wrangler secret put FRONTEND_URL
```

### D. Build and Deploy
```bash
npm run build
wrangler deploy
```

You'll see:
```
✨ Success! Deployed to:
   https://sanpete-pickleball-api.XXXXXX.workers.dev
```

**SAVE THIS WORKER URL!**

---

## Step 3: Connect Frontend to Backend (5 minutes)

1. Go back to Cloudflare Dashboard → Pages
2. Click on your project (`sanpete-pickleball`)
3. Go to **Settings** → **Environment variables**
4. Find `VITE_API_URL`
5. Click **Edit**
6. Paste your Worker URL (from Step 2D)
7. Click **Save**
8. Go to **Deployments** tab
9. Click **Retry deployment** (three dots menu)

---

## Step 4: Test Everything! (5 minutes)

### Test Backend
Visit: `https://your-worker-url/api/health`

Should see:
```json
{"status":"ok","message":"Server is running"}
```

### Test Frontend
Visit: `https://your-site.pages.dev`

Try:
1. ✅ Register a new account
2. ✅ Login
3. ✅ View Events page
4. ✅ View Courts page
5. ✅ View Resources page
6. ✅ View Groups page

---

## 🎉 Success Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Health check returns OK
- [ ] Frontend connects to backend
- [ ] Can register/login
- [ ] All pages load correctly

**Total time: ~30 minutes**

---

## 🆘 If You Hit Issues

**Frontend won't build:**
- Check Node version in build settings (should be 24.x or 20.x)

**Backend deploy fails:**
- Run: `wrangler secret list` to verify secrets are set
- Check: `wrangler whoami` to verify you're logged in

**CORS errors:**
- Make sure FRONTEND_URL secret matches your Pages URL exactly
- Redeploy backend after fixing

**Database errors:**
- Verify DATABASE_URL includes `?sslmode=require`

---

**Let me know when each step is complete or if you hit any issues!**
