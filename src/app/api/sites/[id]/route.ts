import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/sites/[id] - 获取单个网站
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pages: true },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[id] - 更新网站
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, domain, crawlInterval } = body;

    const cleanDomain = domain
      ? domain.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase()
      : undefined;

    // 检查域名是否被其他网站使用
    if (cleanDomain) {
      const existing = await prisma.site.findFirst({
        where: {
          domain: cleanDomain,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "该域名已被其他网站使用" },
          { status: 400 }
        );
      }
    }

    const site = await prisma.site.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(cleanDomain && { domain: cleanDomain }),
        ...(crawlInterval && { crawlInterval }),
      },
    });

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[id] - 删除网站
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.site.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
