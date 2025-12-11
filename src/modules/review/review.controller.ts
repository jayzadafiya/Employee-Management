import { Response, NextFunction } from 'express';
import { IAuthRequest } from '@types';
import * as reviewService from './review.service';
import { successResponse, errorResponse } from '@utils/apiResponse';
import AppError from '@utils/appError';

export const getTopPerformers = async (
  _req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const topPerformers = await reviewService.getTopPerformers();

    successResponse(res, topPerformers, 'Top performers fetched successfully', 200);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    next(error);
  }
};
