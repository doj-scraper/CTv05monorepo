import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redisDel, redisExists, redisSetEx, redisZAdd, redisZCard, redisZTrimBeforeScore } from './redis.js';

export type AuthTokenType = 'access';
export type AuthRole = 'BUYER' | 'ADMIN';

export interface AuthClaims {
  sub: string;
  userId: string;
  email: string;
  role: AuthRole;
  tokenType: AuthTokenType;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: AuthRole;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthenticatedRequestUser = Pick<AuthenticatedUser, 'id' | 'email' | 'role'>;

export interface AuthSessionResult {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function createAccessToken(claims: AuthClaims): string {
  return jwt.sign(claims as object, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'celltech-backend',
    audience: 'celltech-api',
  } as jwt.SignOptions);
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'BUYER' || value === 'ADMIN';
}

function isAuthClaimsPayload(payload: string | jwt.JwtPayload): payload is jwt.JwtPayload & AuthClaims {
  return typeof payload === 'object'
    && payload !== null
    && payload.tokenType === 'access'
    && typeof payload.sub === 'string'
    && typeof payload.userId === 'string'
    && typeof payload.email === 'string'
    && isAuthRole(payload.role);
}

export function verifyAccessToken(token: string): AuthClaims {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET as jwt.Secret, {
      issuer: 'celltech-backend',
      audience: 'celltech-api',
    });

    if (!isAuthClaimsPayload(payload)) {
      throw new HttpError(401, 'Invalid token payload', 'INVALID_TOKEN');
    }

    return {
      sub: payload.sub,
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tokenType: payload.tokenType,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'Access token expired', 'TOKEN_EXPIRED');
    }

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
      throw new HttpError(401, 'Invalid access token', 'INVALID_TOKEN');
    }

    throw error;
  }
}

export function getAccessTokenSecondsRemaining(token: string): number {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;

  if (!decoded?.exp) {
    return 0;
  }

  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
}

export async function blacklistAccessToken(token: string): Promise<void> {
  const ttl = getAccessTokenSecondsRemaining(token);

  if (ttl <= 0) {
    return;
  }

  const stored = await redisSetEx(`auth:blacklist:${hashToken(token)}`, '1', ttl);

  if (!stored) {
    throw new HttpError(503, 'Auth cache unavailable', 'REDIS_UNAVAILABLE');
  }
}

export async function isAccessTokenBlacklisted(token: string): Promise<boolean> {
  try {
    return await redisExists(`auth:blacklist:${hashToken(token)}`);
  } catch {
    throw new HttpError(503, 'Auth cache unavailable', 'REDIS_UNAVAILABLE');
  }
}

export async function registerRefreshSession(userId: string, refreshToken: string, ttlSeconds: number): Promise<void> {
  const stored = await redisSetEx(`auth:refresh:${hashToken(refreshToken)}`, userId, ttlSeconds);

  if (!stored) {
    throw new HttpError(503, 'Auth cache unavailable', 'REDIS_UNAVAILABLE');
  }
}

export async function revokeRefreshSession(refreshToken: string): Promise<void> {
  await redisDel(`auth:refresh:${hashToken(refreshToken)}`);
}

export async function blacklistRefreshToken(refreshToken: string, ttlSeconds: number): Promise<void> {
  const stored = await redisSetEx(`auth:refresh:blacklist:${hashToken(refreshToken)}`, '1', ttlSeconds);

  if (!stored) {
    throw new HttpError(503, 'Auth cache unavailable', 'REDIS_UNAVAILABLE');
  }
}

export async function addRateLimitHit(key: string, timestampMs: number): Promise<void> {
  await redisZTrimBeforeScore(key, timestampMs);
  const added = await redisZAdd(key, timestampMs, `${timestampMs}:${crypto.randomBytes(4).toString('hex')}`);

  if (!added) {
    throw new HttpError(503, 'Rate limit cache unavailable', 'REDIS_UNAVAILABLE');
  }
}

export async function getRateLimitCount(key: string, minTimestampMs: number): Promise<number> {
  await redisZTrimBeforeScore(key, minTimestampMs);
  return redisZCard(key);
}
