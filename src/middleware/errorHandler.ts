import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AppError, sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(`${req.method} ${req.url}: ${err.message}`, {
    stack: err.stack,
    userId: (req as any).user?.id,
  });

  if (err instanceof AppError) {
    const statusCode = err.statusCode;
    const message = err.message;
    const errors = 'errors' in err ? (err as any).errors : undefined;
    sendError(res, message, statusCode, errors);
    return;
  }

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 422, errors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      sendError(res, `Duplicate value for: ${field}`, 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found', 404);
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid data provided', 422);
    return;
  }

  const statusCode = 500;
  const message = config.nodeEnv === 'production'
    ? 'Internal server error'
    : err.message;

  sendError(res, message, statusCode);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.url} not found`, 404);
}
