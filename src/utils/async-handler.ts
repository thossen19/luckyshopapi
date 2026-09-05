import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler so that any rejected promise is
 * forwarded to the Express error handler instead of becoming an
 * unhandled rejection (which leaves the HTTP request hanging forever).
 */
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
