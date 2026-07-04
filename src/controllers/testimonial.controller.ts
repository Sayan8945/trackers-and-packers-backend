import { Request, Response, NextFunction } from "express";
import Testimonial from "../models/Testimonial";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

/* GET /api/testimonials */
export const getTestimonials = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const t = await Testimonial.find({ status: "published" }).sort({ createdAt: -1 });
    successResponse(res, "Testimonials fetched", t);
  } catch (err) { next(err); }
};

/* POST /api/admin/testimonials */
export const createTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const t = await Testimonial.create(req.body);
    successResponse(res, "Testimonial created", t, 201);
  } catch (err) { next(err); }
};

/* PUT /api/admin/testimonials/:id */
export const updateTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) throw ApiError.notFound("Testimonial not found");
    successResponse(res, "Testimonial updated", t);
  } catch (err) { next(err); }
};

/* DELETE /api/admin/testimonials/:id */
export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) throw ApiError.notFound("Testimonial not found");
    successResponse(res, "Testimonial deleted");
  } catch (err) { next(err); }
};
