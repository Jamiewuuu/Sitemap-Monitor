"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Site } from "@/types";
import { cn } from "@/lib/utils";
import { CrawlDialog } from "./CrawlDialog";
import { toast } from "sonner";

interface SidebarProps {
  sites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function Sidebar({
  sites,
  selectedSiteId,
  onSelectSite,
  onRefresh,
  loading,
}: SidebarProps) {
  const [crawlingSite, setCrawlingSite] = useState<Site | null>(null);

  const handleCrawl = async (siteId: string, dateRange: string) => {
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, dateRange }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "抓取失败");
      }

      toast.success(`抓取完成，发现 ${data.newPagesCount} 个新页面`);
      onRefresh();
    } catch (error) {
      console.error("Error crawling:", error);
      toast.error(error instanceof Error ? error.message : "抓取失败");
    }
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground mb-2">
          Your Sites
        </h2>
        <Link href="/sites/new">
          <Button size="sm" className="w-full">
            + 添加网站
          </Button>
        </Link>
      </div>

      {/* 网站列表 */}
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            加载中...
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            暂无网站
          </div>
        ) : (
          <div className="space-y-1">
            {sites.map((site) => (
              <div
                key={site.id}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors",
                  selectedSiteId === site.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectSite(site.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      site.status === "active" ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {site.name}
                    </div>
                    <div
                      className={cn(
                        "text-xs truncate",
                        selectedSiteId === site.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {site.domain}
                    </div>
                  </div>
                </div>
                {site._count && site._count.pages > 0 && (
                  <Badge
                    variant={selectedSiteId === site.id ? "secondary" : "outline"}
                    className="ml-2 flex-shrink-0"
                  >
                    {site._count.pages}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-2 border-t space-y-1">
        {selectedSiteId && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              const site = sites.find((s) => s.id === selectedSiteId);
              if (site) setCrawlingSite(site);
            }}
          >
            抓取当前网站
          </Button>
        )}
        <Link href="/settings">
          <Button size="sm" variant="ghost" className="w-full">
            设置
          </Button>
        </Link>
      </div>

      {/* 抓取弹窗 */}
      {crawlingSite && (
        <CrawlDialog
          open={!!crawlingSite}
          onOpenChange={(open) => !open && setCrawlingSite(null)}
          siteName={crawlingSite.name}
          siteId={crawlingSite.id}
          onCrawl={handleCrawl}
        />
      )}
    </div>
  );
}
