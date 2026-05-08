import { Response } from 'express';

interface ApiResponseOptions {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = ({
  res,
  statusCode = 200,
  success = true,
  message = 'Success',
  data,
  pagination,
}: ApiResponseOptions) => {
  const response: any = { success, message };
  if (data !== undefined) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string, errors?: any) => {
  const response: any = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};
