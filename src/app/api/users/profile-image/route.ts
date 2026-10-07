import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      success: true,
      profileImage: updatedUser.profileImage,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile photo." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: null },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      success: true,
      profileImage: null,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove profile photo." },
      { status: 500 }
    );
  }
}
