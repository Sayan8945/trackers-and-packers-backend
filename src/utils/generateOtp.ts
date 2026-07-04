import crypto from "crypto";

/** Generate a cryptographically random 6-digit numeric OTP */
export const generateOtp = (): string => {
  const bytes = crypto.randomBytes(3);          // 3 bytes → up to 16777215
  const num = bytes.readUIntBE(0, 3) % 900000;  // keep in [0, 899999]
  return String(100000 + num);                   // pad to 6 digits
};

/** OTP expiry: current time + minutes */
export const otpExpiresAt = (minutes = 5): Date => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};
