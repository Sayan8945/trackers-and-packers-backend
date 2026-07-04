import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder = "sarkar-packers",
  publicId?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        ...(publicId && { public_id: publicId }),
        transformation: [{ width: 800, crop: "limit", quality: "auto:good" }],
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(500, "Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
