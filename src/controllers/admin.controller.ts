import { Request, Response, NextFunction } from "express";
import Admin from "../models/Admin";
import User from "../models/User";
import Lead from "../models/Lead";
import Blog from "../models/Blog";
import Testimonial from "../models/Testimonial";
import { generateTokenPair } from "../services/token.service";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

/* POST /api/admin/login */
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) throw ApiError.unauthorized("Invalid credentials");

    const valid = await admin.comparePassword(password);
    if (!valid) throw ApiError.unauthorized("Invalid credentials");

    const tokens = await generateTokenPair({ id: admin._id.toString(), role: "admin" });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, "Admin login successful", {
      accessToken: tokens.accessToken,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) { next(err); }
};

/* GET /api/admin/dashboard */
export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalLeads, totalBlogs, totalTestimonials, recentLeads] =
      await Promise.all([
        User.countDocuments(),
        Lead.countDocuments(),
        Blog.countDocuments({ status: "published" }),
        Testimonial.countDocuments({ status: "published" }),
        Lead.find().sort({ createdAt: -1 }).limit(5),
      ]);

    successResponse(res, "Dashboard data", {
      totalUsers, totalLeads, totalBlogs, totalTestimonials, recentLeads,
    });
  } catch (err) { next(err); }
};
