import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT /api/pages/[id] - 更新页面（标记已读/未读）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead } = body;

    const page = await prisma.page.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}
