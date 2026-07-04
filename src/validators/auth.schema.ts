import { z } from "zod";

export const FirebaseLoginSchema = z.object({
  idToken: z.string().min(1, "Firebase ID token is required"),
});

export const RegisterSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email"),
  mobile:   z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit mobile number").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email:    z.string().email().optional(),
  mobile:   z.string().optional(),
  password: z.string().min(1, "Password required"),
}).refine(d => d.email || d.mobile, { message: "Email or mobile required" });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const ResetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const OtpSchema = z.object({
  identifier: z.string().min(1, "Email or mobile required"),
  otp:        z.string().length(6, "OTP must be 6 digits"),
});

export const SendOtpSchema = z.object({
  identifier: z.string().min(1),
});
