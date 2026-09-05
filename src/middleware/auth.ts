import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, AuthUser } from '../types';
import { UnauthorizedError, ForbiddenError, AppError } from '../utils/response';
import { logger } from '../utils/logger';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
      req.user = decoded;
    }
  } catch {
    // Silently continue without auth
  }
  next();
}

export function requireStoreAccess(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError());
  }
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  if (!req.user.storeId) {
    return next(new ForbiddenError('No store associated with this account'));
  }
  next();
}

export function generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, storeId: user.storeId },
    config.jwt.secret as jwt.Secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    config.jwt.refreshSecret as jwt.Secret,
    { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
}
