import { Router } from 'express';
import { buildHealthResponse, checkDatabaseHealth, checkRedisHealth } from '../lib/health.js';
import { logger } from '../lib/logger.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [database, redis] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const payload = buildHealthResponse(database, redis);
    res.status(payload.ready ? 200 : 503).json(payload);
  } catch (err) {
    logger.error({ err }, 'Health check failed');
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      ready: false,
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'unhealthy', latencyMs: null, error: 'Health check failed' },
        redis: { status: 'unavailable', latencyMs: null, error: 'Health check failed' },
      },
    });
  }
});

export default router;
