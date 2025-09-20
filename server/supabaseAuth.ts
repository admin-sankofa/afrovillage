import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtHeader, type JwtPayload, type VerifyErrors } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { UpsertUser } from '@shared/schema';
import { storage } from './storage';

const rawSupabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const SUPABASE_URL = rawSupabaseUrl || undefined;
const SUPABASE_JWKS_URL = (process.env.SUPABASE_JWKS_URL ?? (SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/keys` : undefined))?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable.');
}

if (!SUPABASE_JWKS_URL) {
  throw new Error('Missing SUPABASE_JWKS_URL environment variable.');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable.');
}

const jwks = jwksClient({
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
  rateLimit: true,
  jwksUri: SUPABASE_JWKS_URL,
  timeout: 5000,
  requestHeaders: {
    apikey: SUPABASE_ANON_KEY,
  },
});

type VerifiedSupabaseClaims = JwtPayload & {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function getSigningKey(header: JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) {
      reject(new Error('missing_kid'));
      return;
    }

    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
        return;
      }

      const signingKey = key?.getPublicKey?.();
      if (!signingKey) {
        reject(new Error('missing_public_key'));
        return;
      }

      resolve(signingKey);
    });
  });
}

async function verifyJwt(token: string): Promise<VerifiedSupabaseClaims> {
  const decoded = await new Promise<VerifiedSupabaseClaims>((resolve, reject) => {
    jwt.verify(
      token,
      async (header, callback) => {
        try {
          const key = await getSigningKey(header);
          callback(null, key);
        } catch (err) {
          callback(err as VerifyErrors);
        }
      },
      {
        algorithms: ['RS256'],
      },
      (error, payload) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(payload as VerifiedSupabaseClaims);
      },
    );
  });

  return decoded;
}

function mapJwtError(error: VerifyErrors | Error) {
  switch (error.name) {
    case 'TokenExpiredError':
      return { status: 401, message: 'Unauthorized - Token expired', reason: 'token_expired' as const };
    case 'JsonWebTokenError':
      return { status: 401, message: 'Unauthorized - Invalid token signature', reason: 'invalid_signature' as const };
    case 'NotBeforeError':
      return { status: 401, message: 'Unauthorized - Token not yet active', reason: 'token_not_active' as const };
    case 'JwksError':
    case 'SigningKeyNotFoundError':
      return { status: 401, message: 'Unauthorized - Unable to fetch signing keys', reason: 'jwks_fetch_error' as const };
    default:
      if (error.message === 'missing_kid' || error.message === 'missing_public_key') {
        return { status: 401, message: 'Unauthorized - Invalid token header', reason: 'invalid_token_header' as const };
      }

      return { status: 401, message: 'Unauthorized - Auth verification failed', reason: 'auth_verification_failed' as const };
  }
}

const reasonHints: Record<string, string> = {
  missing_header: 'Ensure the client sends Authorization: Bearer <token>.',
  invalid_payload: 'Supabase token payload is missing required claims.',
  token_expired: 'Supabase session expired; refresh the session.',
  token_not_active: 'Token is not yet valid; check system clock drift.',
  invalid_signature: 'Token signature rejected; confirm project keys and service URLs.',
  jwks_fetch_error: 'Unable to fetch JWKS. Verify SUPABASE_JWKS_URL, anon key header, and network access.',
  invalid_token_header: 'Token header missing kid/public key. Ensure a Supabase-issued JWT is used.',
  auth_verification_failed: 'Unexpected verification failure; check server logs for details.',
};

function deny(res: Response, req: Request, reason: string, message: string) {
  console.warn('Supabase auth denied', {
    path: req.originalUrl,
    method: req.method,
    reason,
    hint: reasonHints[reason],
  });
  return res.status(401).json({ message, reason });
}

export const verifySupabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization ?? '';
    const hasBearer = authHeader.startsWith('Bearer ');

    if (!hasBearer) {
      return deny(res, req, 'missing_header', 'Unauthorized - Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      return deny(res, req, 'missing_header', 'Unauthorized - Missing bearer token');
    }

    const decoded = await verifyJwt(token);

    if (!decoded?.sub) {
      return deny(res, req, 'invalid_payload', 'Unauthorized - Invalid token payload');
    }

    // Keep a lightweight audit trail without exposing tokens
    console.debug('Supabase auth verified', {
      path: req.originalUrl,
      method: req.method,
      sub: decoded.sub,
      expIn: decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : undefined,
    });

    const userMetadata = (decoded.user_metadata ?? {}) as Record<string, unknown>;

    const upsertPayload: UpsertUser = {
      id: decoded.sub,
      email: decoded.email ?? '',
    };

    if (typeof userMetadata.first_name === 'string') {
      upsertPayload.firstName = userMetadata.first_name;
    }

    if (typeof userMetadata.last_name === 'string') {
      upsertPayload.lastName = userMetadata.last_name;
    }

    if (typeof userMetadata.avatar_url === 'string') {
      upsertPayload.profileImageUrl = userMetadata.avatar_url;
    }

    if (typeof decoded.role === 'string') {
      upsertPayload.role = decoded.role;
    }

    await storage.upsertUser(upsertPayload);

    (req as any).user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role ?? 'authenticated',
    };

    (req as any).auth = {
      sub: decoded.sub,
      email: decoded.email,
      exp: decoded.exp,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    const mapped = mapJwtError(error as VerifyErrors | Error);
    console.warn('Supabase auth verification failed', {
      path: req.originalUrl,
      method: req.method,
      reason: mapped.reason,
      hint: reasonHints[mapped.reason] ?? 'See server logs for details.',
    });
    return res.status(mapped.status).json({ message: mapped.message, reason: mapped.reason });
  }
};

export async function checkSupabaseKeys() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(SUPABASE_JWKS_URL, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
      signal: controller.signal,
    });

    if (response.ok) {
      return { ok: true, status: response.status } as const;
    }

    const text = await response.text();
    return { ok: false, status: response.status, text } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, status: 0, text: message } as const;
  } finally {
    clearTimeout(timeout);
  }
}

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  jwksUrl: SUPABASE_JWKS_URL,
};
