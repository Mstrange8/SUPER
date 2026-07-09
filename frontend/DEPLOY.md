# Cloudflare Pages Deployment

This frontend is configured to deploy to Cloudflare Pages.

## Build Settings

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `frontend`
- **Node version**: 24.x

## Environment Variables

Set these in Cloudflare Pages dashboard:

```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

## Deploy via CLI

```bash
# From the frontend directory
npm run build
npx wrangler pages deploy dist --project-name=sanpete-pickleball
```

## Deploy via Git (Recommended)

1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project"
4. Connect to GitHub repository
5. Configure build settings (above)
6. Deploy!

Auto-deploys on every push to main branch.
