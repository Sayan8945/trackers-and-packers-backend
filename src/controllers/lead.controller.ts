import { Request, Response, NextFunction } from "express";
import Lead from "../models/Lead";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

/* POST /api/leads */
export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.create(req.body);
    successResponse(res, "Quote request received. We will contact you shortly.", lead, 201);
  } catch (err) { next(err); }
};

/* GET /api/admin/leads */
export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  ?? 1);
    const limit  = Math.min(100, Number(req.query.limit) ?? 20);
    const status = req.query.status as string | undefined;

    const filter = status ? { status } : {};
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Lead.countDocuments(filter),
    ]);

    successResponse(res, "Leads fetched", { leads, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/* GET /api/admin/leads/:id */
export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw ApiError.notFound("Lead not found");
    successResponse(res, "Lead fetched", lead);
  } catch (err) { next(err); }
};

/* PUT /api/admin/leads/:id */
export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!lead) throw ApiError.notFound("Lead not found");
    successResponse(res, "Lead status updated", lead);
  } catch (err) { next(err); }
};

/* DELETE /api/admin/leads/:id */
export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) throw ApiError.notFound("Lead not found");
    successResponse(res, "Lead deleted");
  } catch (err) { next(err); }
};
