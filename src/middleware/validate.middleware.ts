import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "../utils/ApiResponse";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }));
      errorResponse(res, "Validation failed", 422, errors);
      return;
    }
    req.body = result.data;
    next();
  };
