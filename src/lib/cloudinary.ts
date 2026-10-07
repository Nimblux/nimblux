import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary credentials
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

export const FOLDER_MAP: Record<UploadFolder, string> = {
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
 * Upload a file buffer directly to Cloudinary via memory stream.
 * Absolutely NO local filesystem runtime storage (no fs.mkdir / fs.writeFile)
 * to comply with Vercel serverless environment.
 */
export async function uploadImage(
  buffer: Buffer,
  folderType: UploadFolder,
  _fileName?: string
): Promise<UploadResult> {
  const targetFolder = FOLDER_MAP[folderType] || "nimblux/opportunities";

  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables."
    );
  }

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
          reject(error || new Error("Failed to upload image to Cloudinary."));
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

/**
 * Generate a secure server-side signed upload signature
 * for direct browser-to-Cloudinary uploads without exposing CLOUDINARY_API_SECRET.
 */
export function generateUploadSignature(folderType: UploadFolder) {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const targetFolder = FOLDER_MAP[folderType] || "nimblux/opportunities";
  const paramsToSign = {
    folder: targetFolder,
    timestamp,
  };

  const secret = process.env.CLOUDINARY_API_SECRET || "";
  const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);

  return {
    signature,
    timestamp,
    folder: targetFolder,
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  };
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured || !publicId || publicId.startsWith("local-")) {
    return true;
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch {
    return false;
  }
}
