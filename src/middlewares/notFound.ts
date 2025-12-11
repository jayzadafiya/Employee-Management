import { Request, Response, NextFunction } from 'express';
import AppError from '@utils/appError';

const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

export default notFound;
