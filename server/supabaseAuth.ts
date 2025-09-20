import type { NextFunction, Request, Response } from 'express';
import {
  createRemoteJWKSet,
  jwtVerify,
  errors as joseErrors,
  type JWTPayload,
} from 'jose';
import type { UpsertUser } from '@shared/schema';
import { storage } from './storage';

const rawSupabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '');
if (!rawSupabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable.');
}

const SUPABASE_URL = rawSupabaseUrl;
const DEFAULT_JWKS_URL = `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
const SUPABASE_JWKS_URL = (process.env.SUPABASE_JWKS_URL ?? DEFAULT_JWKS_URL).replace(/\/+$/, '');
const SUPABASE_ISSUER = `${SUPABASE_URL}/auth/v1`;

const jwksUrlInstance = new URL(SUPABASE_JWKS_URL);
const JWKS = createRemoteJWKSet(jwksUrlInstance, {
  cooldownDuration: 10 * 60 * 1000,
  timeoutDuration: 5000,
});

type VerifiedSupabaseClaims = JWTPayload & {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function mapJoseError(error: unknown) {
  if (error instanceof joseErrors.JWTExpired) {
    return { status: 401, message: 'Unauthorized - Token expired', reason: 'token_expired' as const };
  }

  if (error instanceof joseErrors.JWSSignatureVerificationFailed || error instanceof joseErrors.JWKSNoMatchingKey) {
    return { status: 401, message: 'Unauthorized - Invalid token signature', reason: 'invalid_signature' as const };
  }

  if (error instanceof joseErrors.JWTClaimValidationFailed) {
    return { status: 401, message: 'Unauthorized - Invalid token claims', reason: 'invalid_claims' as const };
  }

  if (error instanceof joseErrors.JWTNotBefore) {
    return { status: 401, message: 'Unauthorized - Token not yet active', reason: 'token_not_active' as const };
  }

  if (error instanceof joseErrors.JWTInvalid || error instanceof joseErrors.JWSInvalid) {
    return { status: 401, message: 'Unauthorized - Malformed token', reason: 'malformed_token' as const };
  }

  if (error instanceof joseErrors.JOSEError) {
    return { status: 401, message: 'Unauthorized - Auth verification failed', reason: 'auth_verification_failed' as const };
  }

  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError')) {
    return { status: 401, message: 'Unauthorized - Unable to fetch signing keys', reason: 'jwks_fetch_error' as const };
  }

  return { status: 401, message: 'Unauthorized - Auth verification failed', reason: 'auth_verification_failed' as const };
}

const reasonHints: Record<string, string> = {
  missing_header: 'Ensure the client sends Authorization: Bearer <token>.',
  invalid_payload: 'Supabase token payload is missing required claims.',
  token_expired: 'Supabase session expired; refresh the session.',
  token_not_active: 'Token is not yet valid; check system clock drift.',
  invalid_signature: 'Token signature rejected; confirm Supabase project keys and URLs.',
  jwks_fetch_error: 'Unable to fetch JWKS. Verify SUPABASE_URL, network access, and JWKS endpoint availability.',
  invalid_claims: 'Supabase token claims failed validation; ensure issuer/audience match.',
  malformed_token: 'Token is malformed or corrupt; request a fresh Supabase session.',
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

    const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
      issuer: SUPABASE_ISSUER,
      algorithms: ['ES256', 'RS256'],
    });

    const decoded = payload as VerifiedSupabaseClaims;

    if (!decoded?.sub) {
      return deny(res, req, 'invalid_payload', 'Unauthorized - Invalid token payload');
    }

    // Keep a lightweight audit trail without exposing tokens
    console.debug('Supabase auth verified', {
      path: req.originalUrl,
      method: req.method,
      sub: decoded.sub,
      expIn: decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : undefined,
      alg: protectedHeader.alg,
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

    const role = typeof decoded.role === 'string' ? decoded.role : 'authenticated';

    (req as any).user = {
      id: decoded.sub,
      email: decoded.email,
      role,
      header: protectedHeader,
    };

    (req as any).auth = {
      sub: decoded.sub,
      email: decoded.email,
      exp: decoded.exp,
      role,
      alg: protectedHeader.alg,
      kid: protectedHeader.kid,
    };

    (req as any).jwtHeader = protectedHeader;

    return next();
  } catch (error) {
    const mapped = mapJoseError(error);
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
  issuer: SUPABASE_ISSUER,
};
