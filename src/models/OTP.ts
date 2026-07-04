import mongoose, { Document, Schema } from "mongoose";

export type OtpType = "email-verify" | "mobile-verify" | "password-reset";

export interface IOTP extends Document {
  identifier: string;      // email or mobile
  otp:        string;
  type:       OtpType;
  expiresAt:  Date;
  used:       boolean;
}

const OTPSchema = new Schema<IOTP>({
  identifier: { type: String, required: true },
  otp:        { type: String, required: true },
  type:       { type: String, enum: ["email-verify", "mobile-verify", "password-reset"], required: true },
  expiresAt:  { type: Date, required: true },
  used:       { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete expired documents
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>("OTP", OTPSchema);
