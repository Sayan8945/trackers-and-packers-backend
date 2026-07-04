import OTP, { OtpType } from "../models/OTP";
import { generateOtp, otpExpiresAt } from "../utils/generateOtp";
import { sendOtpEmail } from "./email.service";
import { ApiError } from "../utils/ApiError";

/**
 * Create and persist an OTP, then dispatch via email.
 * SMS OTP is now handled client-side via Firebase Phone Authentication —
 * the Twilio integration has been removed.
 */
export const sendOtp = async (
  identifier: string,
  type: OtpType,
  channel: "email" | "sms" = "email"
): Promise<void> => {
  if (channel === "sms") {
    // SMS OTP is delegated to Firebase Phone Auth on the client.
    // This code path should no longer be reached after the migration.
    throw ApiError.badRequest(
      "SMS OTP is handled by Firebase Phone Authentication on the client."
    );
  }

  const otp = generateOtp();

  // Invalidate any existing OTPs for this identifier + type
  await OTP.deleteMany({ identifier, type });
  await OTP.create({ identifier, otp, type, expiresAt: otpExpiresAt(5) });
  await sendOtpEmail(identifier, otp);
};

/** Verify OTP and mark as used */
export const verifyOtp = async (
  identifier: string,
  otp: string,
  type: OtpType
): Promise<boolean> => {
  const record = await OTP.findOne({ identifier, type, used: false });

  if (!record) throw ApiError.badRequest("OTP not found or already used");
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    throw ApiError.badRequest("OTP has expired");
  }
  if (record.otp !== otp) throw ApiError.badRequest("Invalid OTP");

  record.used = true;
  await record.save();
  return true;
};
