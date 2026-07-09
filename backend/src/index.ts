import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import courtRoutes from './routes/court.routes';
import resourceRoutes from './routes/resource.routes';
import donationRoutes from './routes/donation.routes';
import groupRoutes from './routes/group.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Stripe webhook needs raw body, so we add it before express.json()
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server for local development
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

// Export for Cloudflare Workers
export default app;
