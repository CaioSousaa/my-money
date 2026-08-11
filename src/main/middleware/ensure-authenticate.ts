import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../adapters/errors/app-error';
import { JwtTokenProvider } from '../../external/providers/jwt-token-provider';

const tokenProvider = new JwtTokenProvider();

export function ensureAuthenticate(request: Request, response: Response, next: NextFunction): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('token is missing', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const userId = tokenProvider.verify(token);
    request.user_id = userId;
    return next();
  } catch {
    throw new AppError('invalid token', 401);
  }
}
