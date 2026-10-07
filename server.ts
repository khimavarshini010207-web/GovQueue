import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db/database.js';
import { seedDatabase } from './src/server/db/seed.js';
import { errorHandler } from './src/server/middleware/error.js';

import authRoutes from './src/server/routes/auth.js';
import servicesRoutes from './src/server/routes/services.js';
import centersRoutes from './src/server/routes/centers.js';
import availabilityRoutes from './src/server/routes/availability.js';
import appointmentsRoutes from './src/server/routes/appointments.js';
import queuesRoutes from './src/server/routes/queues.js';
import tokensRoutes from './src/server/routes/tokens.js';
import notificationsRoutes from './src/server/routes/notifications.js';
import aiRoutes from './src/server/routes/ai.js';
import adminRoutes from './src/server/routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Initialize DB & Seed
  await db.init();
  await seedDatabase();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/centers', centersRoutes);
  app.use('/api/availability', availabilityRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/queues', queuesRoutes);
  app.use('/api/queue-tokens', tokensRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'GovQueue AI',
      timestamp: new Date().toISOString(),
    });
  });

  // Global Error Handler for /api routes
  app.use('/api', errorHandler);

  // Vite middleware in development / static dist in production
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GovQueue AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
