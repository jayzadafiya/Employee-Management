import { Request, Response, NextFunction } from 'express';
import AppError from '@utils/appError';
import config from '@config/config';
import { IErrorResponse } from '@types';

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

const sendErrorDev = (err: any, res: Response): void => {
  const response: IErrorResponse = {
    success: false,
    message: err.message,
    error: {
      statusCode: err.statusCode,
      status: err.status,
      stack: err.stack,
      details: err,
    },
  };

  res.status(err.statusCode).json(response);
};

const sendErrorProd = (err: any, res: Response): void => {
  if (err.isOperational) {
    const response: IErrorResponse = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
  } else {
    console.error('❌ ERROR:', err);

    const response: IErrorResponse = {
      success: false,
      message: 'Something went wrong!',
    };
    res.status(500).json(response);
  }
};

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else if (config.env === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default errorHandler;
