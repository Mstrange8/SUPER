# Backend Deployment Checklist

## 🎯 Prerequisites
- [x] Neon database set up and migrated
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Frontend URL obtained (e.g., https://sanpete-pickleball.pages.dev)

## 📋 Deployment Steps

### 1. Authenticate Wrangler
```bash
cd /Users/matthewstrange/GitHub/super/backend
wrangler login
```
**Status:** ⏳ Not started

---

### 2. Set Environment Secrets

Run these commands **one by one**, pasting the correct value when prompted:

```bash
# Your Neon database connection string
wrangler secret put DATABASE_URL

# A random secret string (e.g., use: openssl rand -base64 32)
wrangler secret put JWT_SECRET

# From your Stripe dashboard
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Your frontend URL from Cloudflare Pages
wrangler secret put FRONTEND_URL

# Optional: Google Maps API key
wrangler secret put GOOGLE_MAPS_API_KEY
```

**Checklist:**
- [ ] DATABASE_URL set
- [ ] JWT_SECRET set
- [ ] STRIPE_SECRET_KEY set
- [ ] STRIPE_WEBHOOK_SECRET set
- [ ] FRONTEND_URL set
- [ ] GOOGLE_MAPS_API_KEY set (optional)

---

### 3. Deploy Backend Worker

```bash
npm run build
wrangler deploy
```

**Expected output:**
```
✨ Built successfully
🌎 Uploading...
✨ Success! Deployed to:
   https://sanpete-pickleball-api.YOUR-SUBDOMAIN.workers.dev
```

**Your Worker URL:** `_______________________________________`
(Write it down!)

**Status:** ⏳ Not started

---

### 4. Update Frontend with Backend URL

1. Go to Cloudflare Dashboard → Pages → Your project
2. Settings → Environment variables
3. Edit `VITE_API_URL`:
   - Production: Your Worker URL (from step 3)
   - Preview: Same Worker URL
4. Save
5. Retrigger deployment or push a commit

**Status:** ⏳ Not started

---

### 5. Test Deployment

Visit these URLs to verify:

```bash
# Health check
https://your-worker-url/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

Test in your deployed frontend:
1. Register a new account
2. Login
3. View events, courts, resources
4. Create a post (if logged in)

**Test Results:**
- [ ] Health endpoint works
- [ ] Frontend loads
- [ ] Registration works
- [ ] Login works
- [ ] Can view data
- [ ] Can create content (logged in)
- [ ] Stripe donation works

---

## 🚨 Common Issues

### Issue: CORS error
**Solution:** Make sure FRONTEND_URL secret is set correctly
```bash
wrangler secret put FRONTEND_URL
# Enter your Pages URL: https://sanpete-pickleball.pages.dev
wrangler deploy
```

### Issue: Database connection fails
**Solution:** Verify DATABASE_URL includes `?sslmode=require`

### Issue: 500 errors
**Solution:** Check logs
```bash
wrangler tail
```

---

## ✅ Deployment Complete Checklist

- [ ] Backend Worker deployed successfully
- [ ] All secrets configured
- [ ] Frontend updated with backend URL
- [ ] Health check passes
- [ ] User registration/login works
- [ ] All features tested

**Once complete, you're ready for Phase 10: Final Testing & Launch!** 🎉
