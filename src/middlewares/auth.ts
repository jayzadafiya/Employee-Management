import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@config/config';
import AppError from '@utils/appError';
import catchAsync from '@utils/catchAsync';
import { IAuthRequest, IJWTPayload } from '@types';

export const mockAuth = (req: IAuthRequest, _res: Response, next: NextFunction): void => {
  req.user = {
    id: 'mock-user-id-123',
    email: 'admin@example.com',
    role: 'admin',
  };
  next();
};

export const protect = catchAsync(async (req: IAuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as IJWTPayload;

    if (!decoded || !decoded.id || !decoded.email) {
      return next(new AppError('Invalid token payload!', 401));
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token!', 401));
  }
});

export const generateToken = (id: string, email: string, role: string = 'user'): string => {
  return jwt.sign({ id, email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  } as jwt.SignOptions);
};
