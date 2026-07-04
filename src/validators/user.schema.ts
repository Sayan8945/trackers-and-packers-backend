import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name:   z.string().min(2).optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
});

export const ContactSchema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  mobile:  z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10).max(1000),
});
