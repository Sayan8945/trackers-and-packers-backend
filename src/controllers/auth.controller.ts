import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User from "../models/User";
import { generateTokenPair, rotateRefreshToken, revokeRefreshToken } from "../services/token.service";
import { sendOtp, verifyOtp } from "../services/otp.service";
import { sendPasswordResetEmail } from "../services/email.service";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { verifyFirebaseToken } from "../config/firebase";

/* POST /api/auth/register
 * Email is accepted and stored but NOT verified — no OTP sent.
 * Users can log in immediately after registration.
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (await User.findOne({ email })) throw ApiError.badRequest("Email already registered");

    const user = await User.create({
      name, email, mobile, password,
      role: "user",
      isEmailVerified: true, // mark verified — no OTP step
    });

    // Auto-login: issue tokens immediately
    const tokens = await generateTokenPair({ id: user._id.toString(), role: "user" });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000,
    });

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

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, "Login successful", {
      accessToken: tokens.accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
              isEmailVerified: user.isEmailVerified, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

/* POST /api/auth/firebase-login
 * Exchange a Firebase ID Token for a JWT pair.
 * Creates the user in MongoDB on first login (phone number not previously seen).
 */
export const firebaseLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw ApiError.badRequest("Firebase ID token is required");

    // 1. Verify the token with Firebase Admin SDK
    const decoded = await verifyFirebaseToken(idToken);

    const firebaseUid   = decoded.uid;
    const phoneNumber   = decoded.phone_number; // e.g. "+919876543210"
    const firebaseEmail = decoded.email;        // present only if phone+email linked

    if (!phoneNumber && !firebaseEmail) {
      throw ApiError.badRequest("No phone number or email associated with this Firebase account");
    }

    // 2. Look up existing user by firebaseUid or mobile number
    let user = await User.findOne({
      $or: [
        { firebaseUid },
        ...(phoneNumber ? [{ mobile: phoneNumber }] : []),
      ],
    });

    if (!user) {
      // 3. Auto-create new user
      const name  = decoded.name ?? `User ${phoneNumber?.slice(-4) ?? ""}`;
      // Email is optional — Firebase phone auth may not carry one
      const email = firebaseEmail ?? `firebase_${firebaseUid}@placeholder.sarkarpackers.in`;

      user = await User.create({
        name,
        email,
        mobile:           phoneNumber ?? undefined,
        firebaseUid,
        provider:         "firebase",
        isMobileVerified: !!phoneNumber,
        isEmailVerified:  !!firebaseEmail,
        role:             "user",
      });
    } else {
      // 4. Sync firebase uid if not yet stored (e.g. existing user logs in via phone for first time)
      if (!user.firebaseUid) {
        user.firebaseUid      = firebaseUid;
        user.provider         = "firebase";
        user.isMobileVerified = true;
        await user.save();
      }
    }

    // 5. Generate JWT pair
    const tokens = await generateTokenPair({ id: user._id.toString(), role: "user" });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, "Login successful", {
      accessToken: tokens.accessToken,
      user: {
        id:               user._id,
        name:             user.name,
        email:            user.email,
        mobile:           user.mobile,
        role:             user.role,
        isEmailVerified:  user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        avatar:           user.avatar,
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
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    successResponse(res, "Token refreshed", { accessToken: tokens.accessToken });
  } catch (err) { next(err); }
};

/* POST /api/auth/logout */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (token) await revokeRefreshToken(token);
    res.clearCookie("refreshToken");
    successResponse(res, "Logged out successfully");
  } catch (err) { next(err); }
};

/* POST /api/auth/send-email-otp — deprecated, kept for backward compat */
export const sendEmailOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Email OTP verification is no longer required." });

/* POST /api/auth/verify-email-otp — deprecated, kept for backward compat */
export const verifyEmailOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Email OTP verification is no longer required." });

/* POST /api/auth/forgot-password */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond 200 to prevent email enumeration
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

/* GET /api/auth/google/callback — called by Passport */
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as InstanceType<typeof User>;
    if (!user) throw ApiError.unauthorized("Google authentication failed");
    const tokens = await generateTokenPair({ id: (user as { _id: { toString(): string } })._id.toString(), role: "user" });
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  } catch (err) { next(err); }
};

// Keep these exported for backward compat (routes still reference them)
export const sendMobileOtp   = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Mobile OTP via backend is deprecated. Use Firebase Phone Auth on the client." });

export const verifyMobileOtp = (_req: Request, res: Response) =>
  res.status(410).json({ success: false, message: "Mobile OTP via backend is deprecated. Use Firebase Phone Auth on the client." });
