import { Request, Response, NextFunction } from "express";
import Contact from "../models/Contact";
import { sendContactNotification } from "../services/email.service";
import { successResponse } from "../utils/ApiResponse";

/* POST /api/contact */
export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.create(req.body);

    // Notify admin
    const adminEmail = process.env.SMTP_FROM?.match(/<(.+)>/)?.[1] ?? process.env.SMTP_USER ?? "";
    if (adminEmail) {
      await sendContactNotification(adminEmail, req.body).catch(() => null);
    }

    successResponse(res, "Your message has been sent. We will get back to you shortly.", contact, 201);
  } catch (err) { next(err); }
};

/* GET /api/admin/contacts */
export const getContacts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    successResponse(res, "Contacts fetched", contacts);
  } catch (err) { next(err); }
};
