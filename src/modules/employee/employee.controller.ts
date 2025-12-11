import { Response, NextFunction } from 'express';
import { IAuthRequest, IEmployeeFilters } from '@types';
import * as employeeService from './employee.service';
import { paginatedResponse, errorResponse } from '@utils/apiResponse';
import AppError from '@utils/appError';

export const getEmployees = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new AppError(
        'Invalid pagination parameters. Page and limit must be valid numbers.',
        400
      );
    }

    const allowedFilters: (keyof IEmployeeFilters)[] = ['department', 'firstName', 'lastName'];
    const filters: IEmployeeFilters = {};

    for (const filter of allowedFilters) {
      const value = req.query[filter];
      if (value && typeof value === 'string' && value.trim()) {
        filters[filter] = value.trim();
      }
    }

    const result = await employeeService.listEmployees(page, limit, filters);

    paginatedResponse(
      res,
      result.employees,
      result.page,
      result.limit,
      result.total,
      'Employees fetched successfully'
    );
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    next(error);
  }
};
export const getEmployeesWithCursorPagination = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cursor = (req.query.cursor as string) || null;
    const limit = parseInt(req.query.limit as string) || 10;

    if (req.query.limit && (isNaN(limit) || limit < 1)) {
      throw new AppError('Invalid limit parameter. Limit must be a valid positive number.', 400);
    }

    const allowedFilters: (keyof IEmployeeFilters)[] = ['department', 'firstName', 'lastName'];
    const filters: IEmployeeFilters = {};

    for (const filter of allowedFilters) {
      const value = req.query[filter];
      if (value && typeof value === 'string' && value.trim()) {
        filters[filter] = value.trim();
      }
    }

    const result = await employeeService.listEmployeesWithCursor(cursor, limit, filters);

    res.status(200).json({
      success: true,
      message: 'Employees fetched successfully with cursor pagination',
      data: result.employees,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    next(error);
  }
};
