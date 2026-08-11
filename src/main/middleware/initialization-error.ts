import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../adapters/errors/app-error';

export function initializationError(
  error: Error,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.description });
  }

  return response.status(500).json({
    status: 'error',
    message: `Internal server error: ${error.message}`,
  });
}
