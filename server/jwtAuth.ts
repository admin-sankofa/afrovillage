import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = 3600; // 3600 seconds = 1 hour

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateJWTToken(user: AuthUser): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWTToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, { algorithms: ['HS256'] });
    return decoded as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Express middleware to verify JWT authentication
 */
export const verifyJWTAuth = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  console.log('JWT Auth verification attempt:', {
    hasAuthHeader: !!authHeader,
    authHeaderStart: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    url: req.url,
    method: req.method
  });
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('JWT Auth failed: No valid authorization header');
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT token
    const payload = verifyJWTToken(token);
    
    console.log('JWT Auth success:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      expiresAt: new Date(payload.exp * 1000).toISOString()
    });

    // Fetch fresh user data from database
    const user = await storage.getUser(payload.userId);
    
    if (!user) {
      console.log('JWT Auth failed: User not found in database');
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('JWT Auth error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

/**
 * Generate a refresh token (longer expiry)
 */
export function generateRefreshToken(user: AuthUser): string {
  const payload = {
    userId: user.id,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: '7d', // 7 days for refresh token
    algorithm: 'HS256',
  });
}