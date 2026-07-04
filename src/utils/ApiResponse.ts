import { Response } from "express";

interface ApiResponseOptions {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: unknown[];
  statusCode?: number;
}

export const sendResponse = (
  res: Response,
  { success, message, data, errors, statusCode = 200 }: ApiResponseOptions
): Response => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data !== undefined && { data }),
    ...(errors && { errors }),
  });
};

export const successResponse = (
  res: Response,
  message: string,
  data?: unknown,
  statusCode = 200
) => sendResponse(res, { success: true, message, data, statusCode });

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown[]
) => sendResponse(res, { success: false, message, errors, statusCode });
