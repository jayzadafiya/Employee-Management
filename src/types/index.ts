import { Request } from 'express';
import { Types } from 'mongoose';

// Auth Types
export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface IUser {
  id: string;
  email: string;
  role: string;
}

export interface IJWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Employee Types
export interface IEmployee {
  _id?: string;
  firstName: string;
  lastName: string;
  department: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmployeeFilters {
  department?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

export interface IEmployeeListResult {
  employees: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
}

export interface ICursorPagination {
  nextCursor?: string;
  prevCursor?: string;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface IEmployeeCursorResult {
  employees: Array<Record<string, unknown>>;
  pagination: ICursorPagination;
}

// Review Types
export interface IReview {
  _id?: string;
  employeeId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Types
export interface IApiResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
  error?: Record<string, unknown>;
  pagination?: IPagination;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Error Types
export interface IErrorResponse {
  success: boolean;
  message: string;
  error?: Record<string, unknown>;
  stack?: string;
}
