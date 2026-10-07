import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateUploadSignature, UploadFolder, FOLDER_MAP } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to generate upload signature." },
        { status: 401 }
      );
    }

    const { folder = "opportunities" } = await req.json().catch(() => ({}));

    const validFolders = Object.keys(FOLDER_MAP) as UploadFolder[];
    const targetFolder: UploadFolder = validFolders.includes(folder as UploadFolder)
      ? (folder as UploadFolder)
      : "opportunities";

    const signData = generateUploadSignature(targetFolder);

    return NextResponse.json({
      success: true,
      ...signData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate upload signature." },
      { status: 500 }
    );
  }
}
