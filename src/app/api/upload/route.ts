import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage, UploadFolder } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to upload media." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "opportunities";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Unsupported file format (${file.type}). Allowed formats: JPG, PNG, WEBP, SVG.`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File size exceeds the 5MB maximum limit.",
        },
        { status: 400 }
      );
    }

    const validFolders: UploadFolder[] = [
      "users",
      "organizations",
      "opportunities",
      "events",
      "hackathons",
    ];
    const targetFolder: UploadFolder = validFolders.includes(folder as UploadFolder)
      ? (folder as UploadFolder)
      : "opportunities";

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImage(buffer, targetFolder, file.name);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
