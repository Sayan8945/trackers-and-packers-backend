import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from "../utils/jwt";
import RefreshToken from "../models/RefreshToken";
import { ApiError } from "../utils/ApiError";

const REFRESH_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const generateTokenPair = async (payload: JwtPayload) => {
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await RefreshToken.create({
    token:    refreshToken,
    userId:   payload.id,
    userType: payload.role === "admin" ? "admin" : "user",
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldToken: string) => {
  const stored = await RefreshToken.findOne({ token: oldToken });
  if (!stored) throw ApiError.unauthorized("Refresh token not found");

  const payload = verifyRefreshToken(oldToken) as JwtPayload;

  // Rotate — delete old, issue new pair
  await RefreshToken.deleteOne({ _id: stored._id });
  return generateTokenPair(payload);
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });
};
