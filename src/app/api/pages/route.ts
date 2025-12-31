import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET /api/pages - 获取页面列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");
    const isRead = searchParams.get("isRead");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.PageWhereInput = {};

    if (siteId) {
      where.siteId = siteId;
    }

    if (isRead !== null && isRead !== "") {
      where.isRead = isRead === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { url: { contains: search } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { discoveredAt: "desc" },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
        take: limit,
        skip: offset,
      }),
      prisma.page.count({ where }),
    ]);

    // 获取未读数量
    const unreadCount = await prisma.page.count({
      where: { ...where, isRead: false },
    });

    return NextResponse.json({
      pages,
      total,
      unreadCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
