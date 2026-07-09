# Cloudflare Workers Migration Plan

## Overview
Converting Express backend to Cloudflare Workers using:
- **Hono** (Workers-native framework, Express-like API)
- **@neondatabase/serverless** (Workers-compatible PostgreSQL client)

## Migration Steps

### Phase 1: Core Infrastructure ✅
- [x] Install Hono and Neon serverless client
- [ ] Create new Workers entry point
- [ ] Set up database connection with Neon
- [ ] Create authentication middleware

### Phase 2: Route Migration
- [ ] Auth routes (register, login, profile)
- [ ] Events routes (CRUD)
- [ ] Courts routes (CRUD)
- [ ] Resources routes (CRUD)
- [ ] Groups routes (CRUD)
- [ ] Posts routes (CRUD)
- [ ] Comments routes (CRUD)
- [ ] Donations routes (Stripe)

### Phase 3: Testing & Deployment
- [ ] Test locally with wrangler dev
- [ ] Deploy to Workers
- [ ] Test all endpoints
- [ ] Update frontend URL

## Key Changes

### 1. Framework: Express → Hono
```typescript
// OLD (Express)
app.get('/api/users', (req, res) => {
  res.json({ users });
});

// NEW (Hono)
app.get('/api/users', (c) => {
  return c.json({ users });
});
```

### 2. Database: pg → @neondatabase/serverless
```typescript
// OLD (pg)
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// NEW (@neondatabase/serverless)
import { neonConfig, Pool } from '@neondatabase/serverless';
const pool = new Pool({ connectionString: env.DATABASE_URL });
```

### 3. Environment: process.env → c.env
```typescript
// OLD
const secret = process.env.JWT_SECRET;

// NEW
const secret = c.env.JWT_SECRET;
```

## Estimated Time: 2-3 hours

Let's proceed step by step!
