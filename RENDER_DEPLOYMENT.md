# Deploy Backend to Render.com (Alternative to Workers)

## Why Render Instead of Workers?

Express uses Node.js features that don't work in Cloudflare Workers. Render provides:
- ✅ Full Node.js support (no compatibility issues)
- ✅ Free tier available
- ✅ PostgreSQL connections work perfectly
- ✅ Simple deployment from GitHub
- ✅ Automatic HTTPS

---

## Step-by-Step: Deploy to Render

### 1. Sign up for Render
Go to: https://render.com/
- Click "Get Started"
- Sign up with GitHub

### 2. Create a New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the `super` repository

### 3. Configure the Service

| Setting | Value |
|---------|-------|
| Name | `sanpete-pickleball-api` |
| Region | Oregon (or closest to you) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Instance Type | `Free` |

### 4. Add Environment Variables

Click "Advanced" → Add environment variables:

```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=placeholder
FRONTEND_URL=https://your-site.pages.dev
NODE_ENV=production
PORT=3000
```

### 5. Create Service
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- You'll get a URL like: `https://sanpete-pickleball-api.onrender.com`

### 6. Update Frontend
- Go to Cloudflare Pages → Settings → Environment variables
- Set `VITE_API_URL` to your Render URL
- Redeploy frontend

---

## Test Your Deployment

Visit: `https://your-render-url.onrender.com/api/health`

Should see: `{"status":"ok","message":"Server is running"}`

---

## Benefits of Render

- ✅ FREE tier (750 hours/month)
- ✅ Zero code changes needed
- ✅ Automatic deployments from GitHub
- ✅ Built-in HTTPS
- ✅ Easy environment variable management
- ⚠️ Free tier sleeps after 15 min inactivity (first request takes ~30s)

---

## Cost Comparison

| Service | Frontend | Backend | Database | Total |
|---------|----------|---------|----------|-------|
| Cloudflare + Render + Neon | FREE | FREE | FREE | **$0/month** |

---

## Need Another Option?

**Railway.app** - Similar to Render, $5/month
**Heroku** - More expensive but well-established
**Keep local for now** - Use your local backend temporarily

Let me know which option you prefer!
