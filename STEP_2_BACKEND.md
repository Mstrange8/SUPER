# Step 2: Backend Deployment - START HERE

## Quick Checklist
- [ ] Generate JWT secret
- [ ] Login to Wrangler
- [ ] Set 5 secrets
- [ ] Deploy backend
- [ ] Save Worker URL

---

## Command 1: Generate JWT Secret

```bash
openssl rand -base64 32
```

**OUTPUT WILL LOOK LIKE:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6==`

📋 **COPY THIS OUTPUT** - you'll paste it in the next step!

---

## Command 2: Login to Wrangler

```bash
cd /Users/matthewstrange/GitHub/super/backend
wrangler login
```

- Browser will open
- Click **"Allow"**
- Return to terminal

---

## Command 3: Set Secrets (Run ONE BY ONE)

### Secret 1: DATABASE_URL
```bash
wrangler secret put DATABASE_URL
```
**Paste your Neon connection string** (should include `?sslmode=require`)

---

### Secret 2: JWT_SECRET
```bash
wrangler secret put JWT_SECRET
```
**Paste the random string from Command 1**

---

### Secret 3: STRIPE_SECRET_KEY
```bash
wrangler secret put STRIPE_SECRET_KEY
```
**Paste from Stripe Dashboard** (starts with `sk_test_` or `sk_live_`)

---

### Secret 4: STRIPE_WEBHOOK_SECRET
```bash
wrangler secret put STRIPE_WEBHOOK_SECRET
```
**Paste from Stripe Dashboard** (starts with `whsec_`)

---

### Secret 5: FRONTEND_URL
```bash
wrangler secret put FRONTEND_URL
```
**Paste your Cloudflare Pages URL** (e.g., `https://sanpete-pickleball.pages.dev`)
⚠️ **No trailing slash!**

---

## Command 4: Verify Secrets (Optional but Recommended)

```bash
wrangler secret list
```

Should show all 5 secrets:
- DATABASE_URL
- JWT_SECRET  
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- FRONTEND_URL

---

## Command 5: Deploy!

```bash
npm run build
wrangler deploy
```

**EXPECTED OUTPUT:**
```
✨ Built successfully
🌎 Uploading...
✨ Success! Deployed to:
   https://sanpete-pickleball-api.XXXXXX.workers.dev
```

📋 **COPY YOUR WORKER URL** - you'll need it for Step 3!

---

## ✅ Step 2 Complete Checklist

- [ ] JWT secret generated
- [ ] Wrangler login successful
- [ ] All 5 secrets set
- [ ] Backend deployed successfully
- [ ] Worker URL saved

**Next: Proceed to Step 3 (Connect Frontend to Backend)**

---

## 🆘 Troubleshooting

**Issue: "Not logged in"**
```bash
wrangler logout
wrangler login
```

**Issue: "No such secret"**
Run `wrangler secret list` to see what's set

**Issue: Deploy fails with "Module not found"**
```bash
rm -rf node_modules
npm install
npm run build
wrangler deploy
```

**Issue: CORS error after deploy**
Make sure FRONTEND_URL secret is exactly your Pages URL with no trailing slash
