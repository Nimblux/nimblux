import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Initialize Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

export const isCloudinaryConfigured = Boolean(
  cloudinaryUrl || (cloudName && apiKey && apiSecret)
);

if (isCloudinaryConfigured) {
  if (cloudinaryUrl) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
}

export type UploadFolder =
  | "users"
  | "organizations"
  | "opportunities"
  | "events"
  | "hackathons";

const FOLDER_MAP: Record<UploadFolder, string> = {
  users: "nimblux/users",
  organizations: "nimblux/organizations",
  opportunities: "nimblux/opportunities",
  events: "nimblux/events",
  hackathons: "nimblux/hackathons",
};

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload a file buffer to Cloudinary (or local fallback if Cloudinary credentials are not configured).
 */
export async function uploadImage(
  buffer: Buffer,
  folderType: UploadFolder,
  fileName?: string
): Promise<UploadResult> {
  const targetFolder = FOLDER_MAP[folderType] || "nimblux/general";

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
          transformation:
            folderType === "users"
              ? [{ width: 500, height: 500, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }]
              : folderType === "organizations"
              ? [{ width: 400, height: 400, crop: "fit", quality: "auto", fetch_format: "auto" }]
              : [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Failed to upload image to Cloudinary"));
          } else {
            resolve({
              url: result.secure_url || result.url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Fallback to local public/uploads directory when Cloudinary is not configured
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folderType);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const extension = fileName ? path.extname(fileName) || ".png" : ".png";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${extension}`;
  const filePath = path.join(uploadsDir, uniqueName);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${folderType}/${uniqueName}`,
    publicId: `local-${folderType}-${uniqueName}`,
    width: 800,
    height: 800,
    format: extension.replace(".", ""),
  };
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured || publicId.startsWith("local-")) {
    return true;
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch {
    return false;
  }
}
