import express, { Application } from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import compatibilityRoutes from './routes/compatibility.routes.js';
// Phase 4 routes
import authRoutes from './routes/auth.routes.js';
import cartRoutes from './routes/cart.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import orderRoutes from './routes/orders.routes.js';

export function createApp(): Application {
  const app = express();

  // Core middleware
  app.use(cors(corsOptions));
  app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info({
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    }, 'Incoming request');
    next();
  });

  // Health check
  app.use('/api/health', healthRoutes);
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api', catalogRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/compatibility', compatibilityRoutes);
  
  // Phase 4 - auth routes
  app.use('/api/auth', authRoutes);
  
  // Phase 5 - commerce routes
  app.use('/api/cart', cartRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/orders', orderRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.originalUrl,
    });
  });

  // Error handler must be last
  app.use(errorHandler);

  return app;
}
