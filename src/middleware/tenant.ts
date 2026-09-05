import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export function tenantScope(req: AuthRequest, res: Response, next: NextFunction): void {
  // Store ID will be injected from authenticated user or subdomain
  const storeId = req.user?.storeId;
  if (storeId) {
    (req as any).storeId = storeId;
  }
  next();
}

export function getStoreId(req: AuthRequest): string {
  const storeId = (req as any).storeId || req.user?.storeId;
  if (!storeId) {
    throw new Error('Store context required');
  }
  return storeId;
}
