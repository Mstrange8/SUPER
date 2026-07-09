import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon
neonConfig.fetchConnectionCache = true;

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
};

type Variables = {
  user: { id: number; userId: number; email: string; username: string; role: string } | null;
  db: ReturnType<typeof neon>;
  stripe: Stripe;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS
app.use('*', cors({ origin: (origin) => origin || '*', credentials: true }));

// Initialize DB and Stripe
app.use('*', async (c, next) => {
  c.set('db', neon(c.env.DATABASE_URL));
  c.set('stripe', new Stripe(c.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' }));
  await next();
});

// JWT helpers
const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

async function generateToken(payload: any, secret: string): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey(secret));
}

async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(secret));
    return { ...payload, id: (payload as any).userId, userId: (payload as any).userId };
  } catch { return null; }
}

// Auth middleware
const authenticate = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'No token provided' }, 401);
  const decoded = await verifyToken(authHeader.substring(7), c.env.JWT_SECRET);
  if (!decoded) return c.json({ error: 'Invalid token' }, 401);
  c.set('user', decoded);
  await next();
};

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  const user = c.get('user');
  if (!user || !['admin', 'sub_admin'].includes(user.role)) return c.json({ error: 'Forbidden' }, 403);
  await next();
};

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (c) => {
  const { email, username, password } = await c.req.json();
  if (!email || !username || !password) return c.json({ error: 'Missing fields' }, 400);
  
  const db = c.get('db');
  const existing = await db`SELECT id FROM users WHERE email = ${email} OR username = ${username}`;
  if (existing.length > 0) return c.json({ error: 'User exists' }, 409);
  
  const hash = await bcrypt.hash(password, 10);
  const [user] = await db`INSERT INTO users (email, username, password_hash, role) VALUES (${email}, ${username}, ${hash}, 'user') RETURNING id, email, username, role`;
  const token = await generateToken({ userId: user.id, email: user.email, username: user.username, role: user.role }, c.env.JWT_SECRET);
  return c.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role }, token }, 201);
});

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Missing fields' }, 400);
  
  const db = c.get('db');
  const [user] = await db`SELECT * FROM users WHERE email = ${email}`;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return c.json({ error: 'Invalid credentials' }, 401);
  
  const token = await generateToken({ userId: user.id, email: user.email, username: user.username, role: user.role }, c.env.JWT_SECRET);
  return c.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role }, token });
});

app.get('/api/auth/profile', authenticate, async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const [profile] = await db`SELECT id, email, username, role, created_at FROM users WHERE id = ${user!.userId}`;
  return profile ? c.json(profile) : c.json({ error: 'Not found' }, 404);
});

app.get('/api/auth/users', authenticate, requireAdmin, async (c) => {
  const db = c.get('db');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const users = await db`SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  return c.json({ users, limit, offset });
});

app.patch('/api/auth/users/:userId/role', authenticate, requireAdmin, async (c) => {
  const { role } = await c.req.json();
  if (!['user', 'admin', 'sub_admin'].includes(role)) return c.json({ error: 'Invalid role' }, 400);
  const db = c.get('db');
  const [user] = await db`UPDATE users SET role = ${role}, updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('userId')} RETURNING id, email, username, role`;
  return user ? c.json(user) : c.json({ error: 'Not found' }, 404);
});

// ============ EVENTS ROUTES ============
app.get('/api/events', async (c) => {
  const db = c.get('db');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');
  const events = await db`SELECT * FROM events ORDER BY start_date ASC LIMIT ${limit} OFFSET ${offset}`;
  return c.json({ events, limit, offset });
});

app.get('/api/events/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return c.json({ error: 'Query required' }, 400);
  const db = c.get('db');
  const events = await db`SELECT * FROM events WHERE title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'} LIMIT 50`;
  return c.json({ events });
});

app.get('/api/events/date-range', async (c) => {
  const start = c.req.query('start');
  const end = c.req.query('end');
  if (!start || !end) return c.json({ error: 'Start and end required' }, 400);
  const db = c.get('db');
  const events = await db`SELECT * FROM events WHERE start_date >= ${start} AND start_date <= ${end} ORDER BY start_date`;
  return c.json({ events });
});

app.get('/api/events/type/:type', async (c) => {
  const db = c.get('db');
  const events = await db`SELECT * FROM events WHERE event_type = ${c.req.param('type')} ORDER BY start_date LIMIT 100`;
  return c.json({ events });
});

app.get('/api/events/:id', async (c) => {
  const db = c.get('db');
  const [event] = await db`SELECT * FROM events WHERE id = ${c.req.param('id')}`;
  return event ? c.json(event) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/events', authenticate, requireAdmin, async (c) => {
  const { title, description, event_type, start_date, end_date, external_link, color } = await c.req.json();
  if (!title || !event_type || !start_date) return c.json({ error: 'Missing fields' }, 400);
  const db = c.get('db');
  const user = c.get('user');
  const [event] = await db`INSERT INTO events (title, description, event_type, start_date, end_date, external_link, color, created_by) VALUES (${title}, ${description || null}, ${event_type}, ${start_date}, ${end_date || null}, ${external_link || null}, ${color || null}, ${user!.userId}) RETURNING *`;
  return c.json(event, 201);
});

app.patch('/api/events/:id', authenticate, requireAdmin, async (c) => {
  const { title, description, event_type, start_date, end_date, external_link, color } = await c.req.json();
  const db = c.get('db');
  const [event] = await db`UPDATE events SET title = COALESCE(${title}, title), description = COALESCE(${description}, description), event_type = COALESCE(${event_type}, event_type), start_date = COALESCE(${start_date}, start_date), end_date = COALESCE(${end_date}, end_date), external_link = COALESCE(${external_link}, external_link), color = COALESCE(${color}, color), updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('id')} RETURNING *`;
  return event ? c.json(event) : c.json({ error: 'Not found' }, 404);
});

app.delete('/api/events/:id', authenticate, requireAdmin, async (c) => {
  const db = c.get('db');
  const [event] = await db`DELETE FROM events WHERE id = ${c.req.param('id')} RETURNING id`;
  return event ? c.json({ message: 'Deleted' }) : c.json({ error: 'Not found' }, 404);
});

// ============ COURTS ROUTES ============
app.get('/api/courts', async (c) => {
  const db = c.get('db');
  const courts = await db`SELECT * FROM courts ORDER BY name`;
  return c.json({ courts });
});

app.get('/api/courts/:id', async (c) => {
  const db = c.get('db');
  const [court] = await db`SELECT * FROM courts WHERE id = ${c.req.param('id')}`;
  return court ? c.json(court) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/courts', authenticate, requireAdmin, async (c) => {
  const { name, address, city, zip, latitude, longitude, description, surface_type, num_courts, has_lighting, amenities, image_url } = await c.req.json();
  if (!name || !address || !city) return c.json({ error: 'Missing fields' }, 400);
  const db = c.get('db');
  const [court] = await db`INSERT INTO courts (name, address, city, zip, latitude, longitude, description, surface_type, num_courts, has_lighting, amenities, image_url) VALUES (${name}, ${address}, ${city}, ${zip || null}, ${latitude || null}, ${longitude || null}, ${description || null}, ${surface_type || null}, ${num_courts || 0}, ${has_lighting || false}, ${amenities || null}, ${image_url || null}) RETURNING *`;
  return c.json(court, 201);
});

app.patch('/api/courts/:id', authenticate, requireAdmin, async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  const [court] = await db`UPDATE courts SET name = COALESCE(${body.name}, name), address = COALESCE(${body.address}, address), city = COALESCE(${body.city}, city), zip = COALESCE(${body.zip}, zip), latitude = COALESCE(${body.latitude}, latitude), longitude = COALESCE(${body.longitude}, longitude), description = COALESCE(${body.description}, description), surface_type = COALESCE(${body.surface_type}, surface_type), num_courts = COALESCE(${body.num_courts}, num_courts), has_lighting = COALESCE(${body.has_lighting}, has_lighting), amenities = COALESCE(${body.amenities}, amenities), image_url = COALESCE(${body.image_url}, image_url), updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('id')} RETURNING *`;
  return court ? c.json(court) : c.json({ error: 'Not found' }, 404);
});

app.delete('/api/courts/:id', authenticate, requireAdmin, async (c) => {
  const db = c.get('db');
  const [court] = await db`DELETE FROM courts WHERE id = ${c.req.param('id')} RETURNING id`;
  return court ? c.json({ message: 'Deleted' }) : c.json({ error: 'Not found' }, 404);
});

// ============ RESOURCES ROUTES ============
app.get('/api/resources', async (c) => {
  const db = c.get('db');
  const type = c.req.query('type');
  const resources = type 
    ? await db`SELECT * FROM resources WHERE resource_type = ${type} ORDER BY created_at DESC`
    : await db`SELECT * FROM resources ORDER BY created_at DESC`;
  return c.json({ resources });
});

app.get('/api/resources/:id', async (c) => {
  const db = c.get('db');
  const [resource] = await db`SELECT * FROM resources WHERE id = ${c.req.param('id')}`;
  return resource ? c.json(resource) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/resources', authenticate, requireAdmin, async (c) => {
  const { title, description, resource_type, url } = await c.req.json();
  if (!title || !resource_type) return c.json({ error: 'Missing fields' }, 400);
  const db = c.get('db');
  const [resource] = await db`INSERT INTO resources (title, description, resource_type, url) VALUES (${title}, ${description || null}, ${resource_type}, ${url || null}) RETURNING *`;
  return c.json(resource, 201);
});

app.patch('/api/resources/:id', authenticate, requireAdmin, async (c) => {
  const { title, description, resource_type, url } = await c.req.json();
  const db = c.get('db');
  const [resource] = await db`UPDATE resources SET title = COALESCE(${title}, title), description = COALESCE(${description}, description), resource_type = COALESCE(${resource_type}, resource_type), url = COALESCE(${url}, url), updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('id')} RETURNING *`;
  return resource ? c.json(resource) : c.json({ error: 'Not found' }, 404);
});

app.delete('/api/resources/:id', authenticate, requireAdmin, async (c) => {
  const db = c.get('db');
  const [resource] = await db`DELETE FROM resources WHERE id = ${c.req.param('id')} RETURNING id`;
  return resource ? c.json({ message: 'Deleted' }) : c.json({ error: 'Not found' }, 404);
});

// ============ DONATIONS ROUTES ============
app.post('/api/donations/create-payment-intent', async (c) => {
  const { amount } = await c.req.json();
  if (!amount || amount < 100) return c.json({ error: 'Invalid amount (min 100 cents)' }, 400);
  const stripe = c.get('stripe');
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { type: 'donation' },
  });
  return c.json({ clientSecret: paymentIntent.client_secret });
});

// ============ GROUPS ROUTES ============
app.get('/api/groups', async (c) => {
  const db = c.get('db');
  const groups = await db`SELECT g.*, u.username as creator_name, (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count FROM groups g LEFT JOIN users u ON g.created_by = u.id ORDER BY g.created_at DESC`;
  return c.json({ groups });
});

app.get('/api/groups/:id', async (c) => {
  const db = c.get('db');
  const [group] = await db`SELECT g.*, u.username as creator_name FROM groups g LEFT JOIN users u ON g.created_by = u.id WHERE g.id = ${c.req.param('id')}`;
  return group ? c.json(group) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/groups', authenticate, async (c) => {
  const { name, description } = await c.req.json();
  if (!name) return c.json({ error: 'Name required' }, 400);
  const db = c.get('db');
  const user = c.get('user');
  const [group] = await db`INSERT INTO groups (name, description, created_by) VALUES (${name}, ${description || null}, ${user!.userId}) RETURNING *`;
  await db`INSERT INTO group_members (group_id, user_id) VALUES (${group.id}, ${user!.userId})`;
  return c.json(group, 201);
});

app.patch('/api/groups/:id', authenticate, async (c) => {
  const { name, description } = await c.req.json();
  const db = c.get('db');
  const user = c.get('user');
  const [group] = await db`SELECT * FROM groups WHERE id = ${c.req.param('id')}`;
  if (!group) return c.json({ error: 'Not found' }, 404);
  if (group.created_by !== user!.userId && !['admin', 'sub_admin'].includes(user!.role)) return c.json({ error: 'Forbidden' }, 403);
  const [updated] = await db`UPDATE groups SET name = COALESCE(${name}, name), description = COALESCE(${description}, description), updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('id')} RETURNING *`;
  return c.json(updated);
});

app.delete('/api/groups/:id', authenticate, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const [group] = await db`SELECT * FROM groups WHERE id = ${c.req.param('id')}`;
  if (!group) return c.json({ error: 'Not found' }, 404);
  if (group.created_by !== user!.userId && !['admin', 'sub_admin'].includes(user!.role)) return c.json({ error: 'Forbidden' }, 403);
  await db`DELETE FROM groups WHERE id = ${c.req.param('id')}`;
  return c.json({ message: 'Deleted' });
});

app.post('/api/groups/:id/join', authenticate, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const groupId = c.req.param('id');
  const [existing] = await db`SELECT * FROM group_members WHERE group_id = ${groupId} AND user_id = ${user!.userId}`;
  if (existing) return c.json({ error: 'Already a member' }, 400);
  await db`INSERT INTO group_members (group_id, user_id) VALUES (${groupId}, ${user!.userId})`;
  return c.json({ message: 'Joined' });
});

app.post('/api/groups/:id/leave', authenticate, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  await db`DELETE FROM group_members WHERE group_id = ${c.req.param('id')} AND user_id = ${user!.userId}`;
  return c.json({ message: 'Left' });
});

app.get('/api/groups/:id/members', async (c) => {
  const db = c.get('db');
  const members = await db`SELECT u.id, u.username, u.email, gm.joined_at FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ${c.req.param('id')} ORDER BY gm.joined_at`;
  return c.json({ members });
});

// ============ POSTS ROUTES ============
app.get('/api/posts', async (c) => {
  const db = c.get('db');
  const groupId = c.req.query('group_id');
  const posts = groupId
    ? await db`SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.group_id = ${groupId} ORDER BY p.created_at DESC`
    : await db`SELECT p.*, u.username, g.name as group_name FROM posts p JOIN users u ON p.user_id = u.id JOIN groups g ON p.group_id = g.id ORDER BY p.created_at DESC LIMIT 50`;
  return c.json({ posts });
});

app.get('/api/posts/:id', async (c) => {
  const db = c.get('db');
  const [post] = await db`SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ${c.req.param('id')}`;
  return post ? c.json(post) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/posts', authenticate, async (c) => {
  const { group_id, title, content } = await c.req.json();
  if (!group_id || !title || !content) return c.json({ error: 'Missing fields' }, 400);
  const db = c.get('db');
  const user = c.get('user');
  const [post] = await db`INSERT INTO posts (group_id, user_id, title, content) VALUES (${group_id}, ${user!.userId}, ${title}, ${content}) RETURNING *`;
  return c.json(post, 201);
});

app.patch('/api/posts/:id', authenticate, async (c) => {
  const { title, content } = await c.req.json();
  const db = c.get('db');
  const user = c.get('user');
  const [post] = await db`SELECT * FROM posts WHERE id = ${c.req.param('id')}`;
  if (!post) return c.json({ error: 'Not found' }, 404);
  if (post.user_id !== user!.userId && !['admin', 'sub_admin'].includes(user!.role)) return c.json({ error: 'Forbidden' }, 403);
  const [updated] = await db`UPDATE posts SET title = COALESCE(${title}, title), content = COALESCE(${content}, content), updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('id')} RETURNING *`;
  return c.json(updated);
});

app.delete('/api/posts/:id', authenticate, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const [post] = await db`SELECT * FROM posts WHERE id = ${c.req.param('id')}`;
  if (!post) return c.json({ error: 'Not found' }, 404);
  if (post.user_id !== user!.userId && !['admin', 'sub_admin'].includes(user!.role)) return c.json({ error: 'Forbidden' }, 403);
  await db`DELETE FROM posts WHERE id = ${c.req.param('id')}`;
  return c.json({ message: 'Deleted' });
});

// ============ COMMENTS ROUTES ============
app.get('/api/comments', async (c) => {
  const db = c.get('db');
  const postId = c.req.query('post_id');
  if (!postId) return c.json({ error: 'post_id required' }, 400);
  const comments = await db`SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ${postId} ORDER BY c.created_at`;
  return c.json({ comments });
});

app.post('/api/comments', authenticate, async (c) => {
  const { post_id, content } = await c.req.json();
  if (!post_id || !content) return c.json({ error: 'Missing fields' }, 400);
  const db = c.get('db');
  const user = c.get('user');
  const [comment] = await db`INSERT INTO comments (post_id, user_id, content) VALUES (${post_id}, ${user!.userId}, ${content}) RETURNING *`;
  return c.json(comment, 201);
});

app.patch('/api/comments/:id', authenticate, async (c) => {
  const { content } = await c.req.json();
  const db = c.get('db');
  const user = c.get('user');
  const [comment] = await db`SELECT * FROM comments WHERE id = ${c.req.param('id')}`;
  if (!comment) return c.json({ error: 'Not found' }, 404);
  if (comment.user_id !== user!.userId && !['admin', 'sub_admin'].includes(user!.role)) return c.json({ error: 'Forbidden' }, 403);
  const [updated] = await db`UPDATE comments SET content = ${content}, updated_at = CURRENT_TIMESTAMP WHERE id = ${c.req.param('id')} RETURNING *`;
  return c.json(updated);
});

app.delete('/api/comments/:id', authenticate, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const [comment] = await db`SELECT * FROM comments WHERE id = ${c.req.param('id')}`;
  if (!comment) return c.json({ error: 'Not found' }, 404);
  if (comment.user_id !== user!.userId && !['admin', 'sub_admin'].includes(user!.role)) return c.json({ error: 'Forbidden' }, 403);
  await db`DELETE FROM comments WHERE id = ${c.req.param('id')}`;
  return c.json({ message: 'Deleted' });
});

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal error', message: err.message }, 500);
});

export default app;
