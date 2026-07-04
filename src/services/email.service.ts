import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

interface SendMailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export const sendEmail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? '"Sarkar Packers" <noreply@sarkarpackers.in>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error("Failed to send email", { err, to, subject });
    throw err;
  }
};

/* ── Email templates ────────────────────────────────────── */
export const sendOtpEmail = (to: string, otp: string): Promise<void> =>
  sendEmail({
    to,
    subject: "Your OTP - Sarkar Packers",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#0f172a">Sarkar Packers & Movers</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="font-size:42px;letter-spacing:8px;color:#E11D48;text-align:center;background:#fff0f3;padding:20px;border-radius:8px">${otp}</h1>
        <p style="color:#64748b">This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
        <p style="color:#94a3b8;font-size:12px">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

export const sendPasswordResetEmail = (to: string, link: string): Promise<void> =>
  sendEmail({
    to,
    subject: "Reset Your Password - Sarkar Packers",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#0f172a">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:20px 0;background:#E11D48;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });

export const sendContactNotification = (
  adminEmail: string,
  data: { name: string; email: string; subject: string; message: string }
): Promise<void> =>
  sendEmail({
    to: adminEmail,
    subject: `New Contact Form: ${data.subject}`,
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong><br>${data.message}</p>
      </div>
    `,
  });
