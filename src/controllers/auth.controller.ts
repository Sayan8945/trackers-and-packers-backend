import { Request, Response, NextFunction, CookieOptions } from "express";
import crypto from "crypto";
import User from "../models/User";
import { generateTokenPair, rotateRefreshToken, revokeRefreshToken } from "../services/token.service";
import { sendOtp, verifyOtp } from "../services/otp.service";
import { sendPasswordResetEmail } from "../services/email.service";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { verifyFirebaseToken } from "../config/firebase";

/** Centralised refresh-token cookie options.
 *  - Production (cross-origin Vercel ↔ Railway): secure=true, sameSite=none
 *  - Development (same-origin localhost):          secure=false, sameSite=lax
 */
const refreshCookieOptions = (): CookieOptions => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
  };
};

/* POST /api/auth/register */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (await User.findOne({ email })) throw ApiError.badRequest("Email already registered");

    const user = await User.create({
      name, email, mobile, password,
      role: "user",
      isEmailVerified: true,
    });

    const tokens = await generateTokenPair({ id: user._id.toString(), role: "user" });
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());

    successResponse(res, "Registration successful.", {
      accessToken: tokens.accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
              isEmailVerified: user.isEmailVerified, avatar: user.avatar },
    }, 201);
  } catch (err) { next(err); }
};

/* POST /api/auth/login */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, mobile, password } = req.body;

    const user = await User.findOne(email ? { email } : { mobile }).select("+password");
    if (!user) throw ApiError.unauthorized("Invalid credentials");

    const valid = await user.comparePassword(password);
    if (!valid) throw ApiError.unauthorized("Invalid credentials");

    const tokens = await generateTokenPair({ id: user._id.toString(), role: "user" });
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());

    successResponse(res, "Login successful", {
      accessToken: tokens.accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
              isEmailVerified: user.isEmailVerified, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

/* POST /api/auth/firebase-login */
export const firebaseLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw ApiError.badRequest("Firebase ID token is required");

    const decoded = await verifyFirebaseToken(idToken);

    const firebaseUid   = decoded.uid;
    const phoneNumber   = decoded.phone_number;
    const firebaseEmail = decoded.email;

    if (!phoneNumber && !firebaseEmail) {
      throw ApiError.badRequest("No phone number or email associated with this Firebase account");
    }

    let user = await User.findOne({
      $or: [
        { firebaseUid },
        ...(phoneNumber ? [{ mobile: phoneNumber }] : []),
      ],
    });

    if (!user) {
      const name  = decoded.name ?? `User ${phoneNumber?.slice(-4) ?? ""}`;
      const email = firebaseEmail ?? `firebase_${firebaseUid}@placeholder.sarkarpackers.in`;
      user = await User.create({
        name, email,
        mobile:           phoneNumber ?? undefined,
        firebaseUid,
        provider:         "firebase",
        isMobileVerified: !!phoneNumber,
        isEmailVerified:  !!firebaseEmail,
        role:             "user",
      });
    } else if (!user.firebaseUid) {
      user.firebaseUid      = firebaseUid;
      user.provider         = "firebase";
      user.isMobileVerified = true;
      await user.save();
    }

    const tokens = await generateTokenPair({ id: user._id.toString(), role: "user" });
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());

    successResponse(res, "Login successful", {
      accessToken: tokens.accessToken,
      user: {
        id: user._id, name: user.name, email: user.email, mobile: user.mobile,
        role: user.role, isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified, avatar: user.avatar,
      },
    });
  } catch (err) { next(err); }
};

/* POST /api/auth/refresh-token */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) throw ApiError.unauthorized("No refresh token");
    const tokens = await rotateRefreshToken(token);
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());
    successResponse(res, "Token refreshed", { accessToken: tokens.accessToken });
  } catch (err) { next(err); }
};

/* POST /api/auth/logout */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (token) await revokeRefreshToken(token);
    res.clearCookie("refreshToken", refreshCookieOptions());
    successResponse(res, "Logged out successfully");
  } catch (err) { next(err); }
};

/* POST /api/auth/send-email-otp — deprecated */
export const sendEmailOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Email OTP verification is no longer required." });

/* POST /api/auth/verify-email-otp — deprecated */
export const verifyEmailOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Email OTP verification is no longer required." });

/* POST /api/auth/forgot-password */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) { successResponse(res, "If this email exists, a reset link has been sent"); return; }
    const token = crypto.randomBytes(32).toString("hex");
    await sendOtp(email, "password-reset", "email");
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
    await sendPasswordResetEmail(email, link);
    successResponse(res, "Password reset link sent to email");
  } catch (err) { next(err); }
};

/* POST /api/auth/reset-password */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = req.body;
    await verifyOtp(email, otp, "password-reset");
    const user = await User.findOne({ email });
    if (!user) throw ApiError.notFound("User not found");
    user.password = password;
    await user.save();
    successResponse(res, "Password reset successful");
  } catch (err) { next(err); }
};

/* GET /api/auth/google/callback */
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as InstanceType<typeof User>;
    if (!user) throw ApiError.unauthorized("Google authentication failed");
    const tokens = await generateTokenPair({
      id: (user as { _id: { toString(): string } })._id.toString(), role: "user",
    });
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  } catch (err) { next(err); }
};

/* Deprecated mobile OTP stubs */
export const sendMobileOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Mobile OTP via backend is deprecated. Use Firebase Phone Auth on the client." });

export const verifyMobileOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Mobile OTP via backend is deprecated. Use Firebase Phone Auth on the client." });
