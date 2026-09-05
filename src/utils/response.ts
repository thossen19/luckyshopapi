import { Response } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  public errors: any[];
  constructor(errors: any[]) {
    super('Validation failed', 422);
    this.errors = errors;
  }
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: any[]): void {
  const response: ApiResponse = { success: false, message, errors };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number): void {
  const response: ApiResponse<{ data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }> = {
    success: true,
    message: 'Success',
    data: {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
  res.status(200).json(response);
}
