import type { AuthClaims, AuthenticatedRequestUser } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims;
      user?: AuthenticatedRequestUser;
      accessToken?: string;
    }
  }
}

export {};
