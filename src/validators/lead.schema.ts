import { z } from "zod";

export const CreateLeadSchema = z.object({
  name:        z.string().min(2),
  mobile:      z.string().regex(/^[6-9]\d{9}$/),
  email:       z.string().email().optional(),
  moveFrom:    z.string().min(2),
  moveTo:      z.string().min(2),
  moveDate:    z.string().optional(),
  serviceType: z.enum(["household","office","car","bike","local","domestic"]),
  message:     z.string().max(500).optional(),
});

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(["new","contacted","converted","lost"]),
});
