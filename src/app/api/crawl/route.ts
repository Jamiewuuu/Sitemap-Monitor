import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchGoogleForSite } from "@/lib/google-search";

// POST /api/crawl - 触发抓取
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, dateRange = "1w" } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId is required" },
        { status: 400 }
      );
    }

    // 获取网站信息
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 获取 API 配置
    const apiKeyConfig = await prisma.setting.findUnique({
      where: { key: "google_api_key" },
    });
    const cxConfig = await prisma.setting.findUnique({
      where: { key: "google_cx" },
    });

    const apiKey = apiKeyConfig?.value || process.env.GOOGLE_API_KEY;
    const cx = cxConfig?.value || process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
      return NextResponse.json(
        { error: "Google API 未配置，请先在设置中配置 API Key 和 Search Engine ID" },
        { status: 400 }
      );
    }

    // 调用 Google Search API
    const results = await searchGoogleForSite(site.domain, dateRange, apiKey, cx);

    // 获取已存在的 URL
    const existingUrls = new Set(
      (
        await prisma.page.findMany({
          where: { siteId },
          select: { url: true },
        })
      ).map((p) => p.url)
    );

    // 过滤出新页面
    const newPages = results.filter((r) => !existingUrls.has(r.link));

    // 批量创建新页面
    if (newPages.length > 0) {
      for (const p of newPages) {
        try {
          await prisma.page.create({
            data: {
              siteId,
              url: p.link,
              title: p.title,
              discoveredAt: new Date(),
              isRead: false,
            },
          });
        } catch {
          // 忽略重复 URL 错误
        }
      }
    }

    // 更新网站状态
    await prisma.site.update({
      where: { id: siteId },
      data: {
        lastCrawledAt: new Date(),
        status: "active",
        errorMessage: null,
      },
    });

    return NextResponse.json({
      success: true,
      newPagesCount: newPages.length,
      totalFound: results.length,
    });
  } catch (error) {
    console.error("Error crawling:", error);

    // 更新网站错误状态
    const body = await request.clone().json();
    if (body.siteId) {
      await prisma.site.update({
        where: { id: body.siteId },
        data: {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to crawl" },
      { status: 500 }
    );
  }
}
