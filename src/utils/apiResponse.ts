import { Response } from 'express';
import { IApiResponse } from '@types';

export const successResponse = (
  res: Response,
  data: any,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: IApiResponse = {
    success: true,
    message: message || 'Success',
    data,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): Response => {
  const response: IApiResponse = {
    success: false,
    message,
    error: error || undefined,
  };
  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res: Response,
  data: any,
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const response: IApiResponse = {
    success: true,
    message: message || 'Success',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json(response);
};
