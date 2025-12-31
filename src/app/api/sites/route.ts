import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/sites - 获取所有网站
export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { pages: true },
        },
      },
    });
    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

// POST /api/sites - 添加新网站
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain, crawlInterval } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Name and domain are required" },
        { status: 400 }
      );
    }

    // 清理域名格式
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")
      .toLowerCase();

    // 检查是否已存在
    const existing = await prisma.site.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      return NextResponse.json(
        { error: "该域名已存在" },
        { status: 400 }
      );
    }

    const site = await prisma.site.create({
      data: {
        name,
        domain: cleanDomain,
        crawlInterval: crawlInterval || "1d",
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}
