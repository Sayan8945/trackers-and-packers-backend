import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../services/cloudinary.service";

/* GET /api/users/profile */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.jwtUser!.id).select("-password");
    if (!user) throw ApiError.notFound("User not found");
    successResponse(res, "Profile fetched", user);
  } catch (err) { next(err); }
};

/* PUT /api/users/profile */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.jwtUser!.id,
      { name, mobile },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) throw ApiError.notFound("User not found");
    successResponse(res, "Profile updated", user);
  } catch (err) { next(err); }
};

/* PUT /api/users/change-password */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.jwtUser!.id).select("+password");
    if (!user) throw ApiError.notFound("User not found");

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw ApiError.badRequest("Current password is incorrect");

    user.password = newPassword;
    await user.save();
    successResponse(res, "Password changed successfully");
  } catch (err) { next(err); }
};

/* POST /api/users/upload-avatar */
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw ApiError.badRequest("No file uploaded");
    const url = await uploadToCloudinary(req.file.buffer, "sarkar-packers/avatars", `avatar-${req.jwtUser!.id}`);
    await User.findByIdAndUpdate(req.jwtUser!.id, { avatar: url });
    successResponse(res, "Avatar uploaded", { avatar: url });
  } catch (err) { next(err); }
};
