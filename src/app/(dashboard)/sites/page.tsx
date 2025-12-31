"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteCard } from "@/components/SiteCard";
import { CrawlDialog } from "@/components/CrawlDialog";
import { Site } from "@/types";
import { toast } from "sonner";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawlingSite, setCrawlingSite] = useState<Site | null>(null);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data || []);
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("获取网站列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sites/${id}`, { method: "DELETE" });
      toast.success("删除成功");
      fetchSites();
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("删除失败");
    }
  };

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
      fetchSites();
    } catch (error) {
      console.error("Error crawling:", error);
      toast.error(error instanceof Error ? error.message : "抓取失败");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">网站管理</h1>
        <Link href="/sites/new">
          <Button>+ 添加网站</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : sites.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>暂无监控的网站</p>
          <Link href="/sites/new">
            <Button className="mt-4">添加第一个网站</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onCrawl={setCrawlingSite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

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
