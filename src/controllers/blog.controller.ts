import { Request, Response, NextFunction } from "express";
import Blog from "../models/Blog";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

/* ── Admin ───────────────────────────────────────────────── */

/* POST /api/admin/blogs */
export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    if (!data.slug) data.slug = slugify(data.title);
    if (data.status === "published" && !data.publishedAt) data.publishedAt = new Date();
    const blog = await Blog.create(data);
    successResponse(res, "Blog created", blog, 201);
  } catch (err) { next(err); }
};

/* PUT /api/admin/blogs/:id */
export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) throw ApiError.notFound("Blog not found");
    successResponse(res, "Blog updated", blog);
  } catch (err) { next(err); }
};

/* DELETE /api/admin/blogs/:id */
export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) throw ApiError.notFound("Blog not found");
    successResponse(res, "Blog deleted");
  } catch (err) { next(err); }
};

/* GET /api/admin/blogs */
export const getAllBlogsAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    successResponse(res, "Blogs fetched", blogs);
  } catch (err) { next(err); }
};

/* ── Public ──────────────────────────────────────────────── */

/* GET /api/blogs */
export const getPublishedBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Number(req.query.limit) || 9);
    const [blogs, total] = await Promise.all([
      Blog.find({ status: "published" }).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit).select("-content"),
      Blog.countDocuments({ status: "published" }),
    ]);
    successResponse(res, "Blogs fetched", { blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/* GET /api/blogs/:slug */
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" });
    if (!blog) throw ApiError.notFound("Blog not found");
    successResponse(res, "Blog fetched", blog);
  } catch (err) { next(err); }
};
