import type { NextFunction, Request, Response } from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authServiceMocks = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
}));

const rateLimitState = vi.hoisted(() => ({
  hits: [] as string[],
}));

const rateLimitMock = vi.hoisted(() =>
  vi.fn((options: { keyPrefix?: string }) => (req: Request, _res: Response, next: NextFunction) => {
    rateLimitState.hits.push(options.keyPrefix ?? 'rate-limit');
    next();
  })
);

function attachAuthenticatedRequest(req: Request): void {
  const authorization = req.header('authorization')?.trim();

  if (!authorization) {
    const error = new Error('Authorization header required') as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 401;
    error.code = 'MISSING_AUTH_HEADER';
    throw error;
  }

  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  req.accessToken = token;
  req.auth = {
    sub: 'user-123',
    userId: 'user-123',
    email: 'buyer@example.com',
    role: 'BUYER',
    tokenType: 'access',
  };
  req.user = {
    id: 'user-123',
    email: 'buyer@example.com',
    role: 'BUYER',
  };
}

const authMiddlewareMocks = vi.hoisted(() => ({
  requireAuth: vi.fn((req: Request, _res: Response, next: NextFunction) => {
    try {
      attachAuthenticatedRequest(req);
      next();
    } catch (error) {
      next(error);
    }
  }),
  requireTokenAuth: vi.fn((req: Request, _res: Response, next: NextFunction) => {
    try {
      attachAuthenticatedRequest(req);
      next();
    } catch (error) {
      next(error);
    }
  }),
}));

vi.mock('../services/auth.service.js', () => ({
  AuthService: authServiceMocks,
}));

vi.mock('../middleware/rateLimit.js', () => ({
  rateLimit: rateLimitMock,
  createRateLimit: rateLimitMock,
}));

vi.mock('../middleware/auth.js', () => authMiddlewareMocks);

describe('auth routes', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    rateLimitState.hits.length = 0;

    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://celltech:celltech@localhost:5432/celltech_test';
    process.env.JWT_SECRET = 'test-secret-for-auth-routes';

    const { createApp } = await import('../app.js');
    const app = createApp();

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    if (!server) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  it('configures general and endpoint-specific auth rate limits', () => {
    expect(rateLimitMock).toHaveBeenCalledTimes(4);
    expect(rateLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      keyPrefix: 'auth',
      maxRequests: 60,
      windowMs: 15 * 60 * 1000,
    }));
    expect(rateLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      keyPrefix: 'auth:login',
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    }));
    expect(rateLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      keyPrefix: 'auth:register',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    }));
    expect(rateLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      keyPrefix: 'auth:refresh',
      maxRequests: 20,
      windowMs: 15 * 60 * 1000,
    }));
  });

  it('requires register payloads to come from the request body', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register?email=buyer@example.com&password=Password1!`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = (await response.json()) as {
      success: boolean;
      error: string;
      details: Array<{ path: string; message: string }>;
    };

    expect(response.status).toBe(400);
    expect(data).toMatchObject({
      success: false,
      error: 'Validation failed',
    });
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'email' }),
      expect.objectContaining({ path: 'password' }),
    ]));
    expect(authServiceMocks.register).not.toHaveBeenCalled();
    expect(rateLimitState.hits).toEqual(['auth', 'auth:register']);
  });

  it('logs users in through the mounted auth route with the established response shape', async () => {
    const session = {
      user: {
        id: 'user-123',
        email: 'buyer@example.com',
        role: 'BUYER',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 60 * 60 * 24 * 30,
    };
    authServiceMocks.login.mockResolvedValue(session);

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ' buyer@example.com ',
        password: 'Password1!',
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: session,
    });
    expect(authServiceMocks.login).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      password: 'Password1!',
    });
    expect(rateLimitState.hits).toEqual(['auth', 'auth:login']);
  });

  it('checks logout authentication before validation or rate limiting', async () => {
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: 123,
      }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      error: 'Authorization header required',
      code: 'MISSING_AUTH_HEADER',
    });
    expect(authServiceMocks.logout).not.toHaveBeenCalled();
    expect(rateLimitState.hits).toEqual([]);
  });

  it('logs out authenticated users with the access token from auth middleware', async () => {
    authServiceMocks.logout.mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer access-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: 'refresh-token',
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
    expect(authServiceMocks.logout).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(rateLimitState.hits).toEqual(['auth']);
  });

  it('serves the mounted /api/auth/me endpoint for authenticated users', async () => {
    const user = {
      id: 'user-123',
      email: 'buyer@example.com',
      role: 'BUYER',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    authServiceMocks.me.mockResolvedValue(user);

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: 'Bearer access-token',
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: user,
    });
    expect(authServiceMocks.me).toHaveBeenCalledWith('user-123');
    expect(rateLimitState.hits).toEqual(['auth']);
  });
});
