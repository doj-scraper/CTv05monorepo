import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getRedisClient, isRedisConfigured } from '../lib/redis.js';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  message?: string;
  identifier?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

type RedisRateLimitClient = NonNullable<Awaited<ReturnType<typeof getRedisClient>>>;

function getRequestIdentifier(req: Request): string {
  const requestWithUser = req as Request & { user?: { id?: string }; userId?: string };
  const authenticatedUserId = requestWithUser.user?.id ?? requestWithUser.userId;

  if (authenticatedUserId) {
    return `user:${authenticatedUserId}`;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0]?.trim()
    : Array.isArray(forwardedFor)
      ? forwardedFor[0]?.split(',')[0]?.trim()
      : undefined;

  return `ip:${forwardedIp || req.ip || req.socket.remoteAddress || 'unknown'}`;
}

function buildRateLimitKey(req: Request, options: RateLimitOptions): string {
  const prefix = options.keyPrefix ?? 'rate-limit';
  const identifier = options.identifier?.(req) ?? getRequestIdentifier(req);
  return `${prefix}:${identifier}`;
}

async function incrementSlidingWindow(
  client: RedisRateLimitClient,
  key: string,
  windowMs: number,
  maxRequests: number
): Promise<{ allowed: boolean; remaining: number; total: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!client.zremrangebyscore || !client.zcard || !client.zadd || !client.expire) {
    throw new Error('Redis client does not support sorted-set rate limiting commands');
  }

  await client.zremrangebyscore(key, '-inf', windowStart);
  const total = await client.zcard(key);

  if (total >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      total,
    };
  }

  const member = `${now}:${Math.random().toString(36).slice(2)}`;
  await client.zadd(key, now, member);
  await client.expire(key, Math.ceil(windowMs / 1000) + 1);

  return {
    allowed: true,
    remaining: Math.max(maxRequests - total - 1, 0),
    total: total + 1,
  };
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const normalizedOptions: RateLimitOptions = {
    keyPrefix: 'rate-limit',
    ...options,
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    if (normalizedOptions.skip?.(req)) {
      next();
      return;
    }

    if (!isRedisConfigured()) {
      res.status(503).json({
        success: false,
        error: 'Rate limiting requires Redis. Set REDIS_URL to enable distributed rate limiting.',
      });
      return;
    }

    try {
      const client = await getRedisClient();

      if (!client) {
        res.status(503).json({
          success: false,
          error: 'Redis client is unavailable; rate limiting cannot be enforced.',
        });
        return;
      }

      const key = buildRateLimitKey(req, normalizedOptions);
      const result = await incrementSlidingWindow(
        client,
        key,
        normalizedOptions.windowMs,
        normalizedOptions.maxRequests
      );

      if (!result.allowed) {
        res.setHeader('Retry-After', String(Math.ceil(normalizedOptions.windowMs / 1000)));
        res.status(429).json({
          success: false,
          error: normalizedOptions.message ?? 'Too many requests',
        });
        return;
      }

      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error('Rate limiting failed'));
    }
  };
}

export const createRateLimit = rateLimit;
