import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import {
  AuthenticatedUser,
  AuthSessionResult,
  AuthRole,
  HttpError,
  blacklistAccessToken,
  createAccessToken,
  generateRefreshToken,
  hashToken,
  normalizeEmail,
} from '../lib/auth.js';

const PASSWORD_SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

const userSelect = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

type UserRecord = {
  id: string;
  email: string;
  role: AuthRole;
  createdAt: Date;
  updatedAt: Date;
};

function toAuthenticatedUser(user: UserRecord): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createSession(user: AuthenticatedUser, refreshToken: string): AuthSessionResult {
  return {
    user,
    accessToken: createAccessToken({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    }),
    refreshToken,
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  };
}

async function persistRefreshSession(userId: string, refreshToken: string): Promise<void> {
  await prisma.session.create({
    data: {
      userId,
      token: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    },
  });
}

export class AuthService {
  static async register(input: { email: string; password: string }): Promise<AuthSessionResult> {
    const email = normalizeEmail(input.email);
    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: userSelect,
    });

    const refreshToken = generateRefreshToken();
    await persistRefreshSession(user.id, refreshToken);

    return createSession(toAuthenticatedUser(user), refreshToken);
  }

  static async login(input: { email: string; password: string }): Promise<AuthSessionResult> {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const refreshToken = generateRefreshToken();
    await persistRefreshSession(user.id, refreshToken);

    return createSession(toAuthenticatedUser(user), refreshToken);
  }

  static async refresh(input: { refreshToken: string }): Promise<AuthSessionResult> {
    const tokenHash = hashToken(input.refreshToken);
    const session = await prisma.session.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: userSelect,
        },
      },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const refreshToken = generateRefreshToken();

    await prisma.session.update({
      where: { token: tokenHash },
      data: {
        token: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });

    return createSession(toAuthenticatedUser(session.user), refreshToken);
  }

  static async logout(input: { accessToken: string; refreshToken?: string }): Promise<void> {
    if (input.refreshToken) {
      await prisma.session.deleteMany({
        where: { token: hashToken(input.refreshToken) },
      });
    }

    await blacklistAccessToken(input.accessToken);
  }

  static async me(userId: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return toAuthenticatedUser(user);
  }
}
