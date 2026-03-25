import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';
import { requireAuth, requireTokenAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 60,
  keyPrefix: 'auth',
  message: 'Too many authentication requests. Please try again later.',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'auth:login',
  message: 'Too many login attempts. Please try again later.',
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'auth:register',
  message: 'Too many registration attempts. Please try again later.',
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  keyPrefix: 'auth:refresh',
  message: 'Too many refresh attempts. Please try again later.',
});

const emailSchema = z.string().trim().email();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

router.post('/register', authLimiter, registerLimiter, validate(registerSchema, 'body'), async (req, res, next) => {
  try {
    const data = await AuthService.register(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, loginLimiter, validate(loginSchema, 'body'), async (req, res, next) => {
  try {
    const data = await AuthService.login(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', authLimiter, refreshLimiter, validate(refreshSchema, 'body'), async (req, res, next) => {
  try {
    const data = await AuthService.refresh(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireTokenAuth, authLimiter, validate(logoutSchema, 'body'), async (req, res, next) => {
  try {
    await AuthService.logout({
      accessToken: req.accessToken!,
      refreshToken: req.body.refreshToken,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, authLimiter, async (req, res, next) => {
  try {
    const user = await AuthService.me(req.auth!.userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
