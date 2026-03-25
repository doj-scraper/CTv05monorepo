import type { NextFunction, Request, Response } from 'express';
import type { AuthClaims, AuthRole } from '../lib/auth.js';
import { HttpError, isAccessTokenBlacklisted, verifyAccessToken } from '../lib/auth.js';
import { getRedisClient, isRedisConfigured } from '../lib/redis.js';

function extractBearerToken(req: Request): string {
  const authorization = req.header('authorization')?.trim();

  if (!authorization) {
    throw new HttpError(401, 'Authorization header required', 'MISSING_AUTH_HEADER');
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw new HttpError(401, 'Authorization header must use Bearer token', 'INVALID_AUTH_HEADER');
  }

  return match[1].trim();
}

function createAuthCacheUnavailableError(): HttpError {
  return new HttpError(503, 'Auth cache unavailable', 'REDIS_UNAVAILABLE');
}

async function ensureAuthCacheAvailable(): Promise<void> {
  if (!isRedisConfigured()) {
    throw createAuthCacheUnavailableError();
  }

  const client = await getRedisClient();

  if (!client) {
    throw createAuthCacheUnavailableError();
  }
}

function attachUser(req: Request, claims: AuthClaims, token: string): void {
  const user = {
    id: claims.userId,
    email: claims.email,
    role: claims.role,
  };

  req.auth = claims;
  req.accessToken = token;
  req.user = user;
}

export async function requireTokenAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    const claims = verifyAccessToken(token);
    attachUser(req, claims, token);
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    const claims = verifyAccessToken(token);

    await ensureAuthCacheAvailable();

    if (await isAccessTokenBlacklisted(token)) {
      throw new HttpError(401, 'Token has been revoked', 'TOKEN_REVOKED');
    }

    attachUser(req, claims, token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: AuthRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Authentication required', 'AUTH_REQUIRED');
      }

      if (!roles.includes(req.user.role)) {
        throw new HttpError(403, 'Insufficient permissions', 'INSUFFICIENT_ROLE');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
