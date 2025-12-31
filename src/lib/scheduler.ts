import cron from "node-cron";
import { prisma } from "./db";
import { searchGoogleForSite } from "./google-search";

// 检查间隔转换为毫秒
const intervalToMs: Record<string, number> = {
  "12h": 12 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
};

// 执行单个网站的抓取
async function crawlSite(siteId: string, domain: string) {
  console.log(`[Scheduler] Crawling site: ${domain}`);

  try {
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
      console.log(`[Scheduler] API not configured, skipping ${domain}`);
      return;
    }

    // 调用 Google Search API（默认最近一周）
    const results = await searchGoogleForSite(domain, "1w", apiKey, cx);

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

    console.log(
      `[Scheduler] Crawled ${domain}: found ${results.length} pages, ${newPages.length} new`
    );
  } catch (error) {
    console.error(`[Scheduler] Error crawling ${domain}:`, error);

    // 更新错误状态
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}

// 检查并执行需要抓取的任务
async function checkAndCrawl() {
  console.log("[Scheduler] Checking for sites to crawl...");

  const now = new Date();

  try {
    const sites = await prisma.site.findMany({
      where: { status: "active" },
    });

    for (const site of sites) {
      const intervalMs = intervalToMs[site.crawlInterval] || intervalToMs["1d"];
      const lastCrawled = site.lastCrawledAt
        ? new Date(site.lastCrawledAt).getTime()
        : 0;

      // 如果距离上次抓取超过了设定的间隔
      if (now.getTime() - lastCrawled >= intervalMs) {
        await crawlSite(site.id, site.domain);
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error in checkAndCrawl:", error);
  }
}

// 启动定时任务（每分钟检查一次）
let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) {
    return;
  }

  console.log("[Scheduler] Starting scheduler...");

  // 每分钟检查一次是否有需要抓取的网站
  cron.schedule("* * * * *", () => {
    checkAndCrawl();
  });

  schedulerStarted = true;
  console.log("[Scheduler] Scheduler started");
}

// 手动触发检查
export { checkAndCrawl };
