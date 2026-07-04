import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

// Attach JWT payload to req.jwtUser (avoids conflict with passport's req.user typing)
const extractJwt = (req: Request): JwtPayload => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw ApiError.unauthorized();
  const token = header.split(" ")[1];
  return verifyAccessToken(token);
};

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const payload = extractJwt(req);
    if (payload.role !== "user") throw ApiError.forbidden("User access required");
    req.jwtUser = payload;
    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const payload = extractJwt(req);
    if (payload.role !== "admin") throw ApiError.forbidden("Admin access required");
    req.jwtUser = payload;
    next();
  } catch (err) {
    next(err);
  }
};
