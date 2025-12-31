"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page, Site } from "@/types";
import { toast } from "sonner";

interface PageTableProps {
  site: Site;
  onSiteUpdate?: () => void;
}

export function PageTable({ site, onSiteUpdate }: PageTableProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("1d"); // 默认最近一天

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("siteId", site.id);
      if (search) params.set("search", search);

      const res = await fetch(`/api/pages?${params.toString()}`);
      const data = await res.json();
      setPages(data.pages || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  }, [site.id, search]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleCrawl = async () => {
    setCrawling(true);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id, dateRange }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "抓取失败");
      }

      toast.success(`抓取完成，发现 ${data.newPagesCount} 个新页面`);
      fetchPages();
      onSiteUpdate?.();
    } catch (error) {
      console.error("Error crawling:", error);
      toast.error(error instanceof Error ? error.message : "抓取失败");
    } finally {
      setCrawling(false);
    }
  };

  const toggleRead = async (page: Page) => {
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !page.isRead }),
      });
      fetchPages();
    } catch (error) {
      console.error("Error toggling read status:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/pages/read-all?siteId=${site.id}`, { method: "PUT" });
      fetchPages();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("zh-CN");
  };

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{site.name}</h1>
          <p className="text-sm text-muted-foreground">
            {site.domain} · {total} URLs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 时间范围选择器 */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">最近 1 天</SelectItem>
              <SelectItem value="1w">最近 1 周</SelectItem>
              <SelectItem value="2w">最近 2 周</SelectItem>
              <SelectItem value="1m">最近 1 个月</SelectItem>
            </SelectContent>
          </Select>
          {/* 抓取按钮 */}
          <Button onClick={handleCrawl} disabled={crawling}>
            {crawling ? "抓取中..." : "抓取"}
          </Button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search URLs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[300px]"
        />
        <div className="flex-1" />
        {unreadCount > 0 && (
          <Badge variant="secondary">{unreadCount} 未读</Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          全部标记已读
        </Button>
      </div>

      {/* 表格 */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {search ? "未找到匹配的页面" : "暂无页面数据，请点击「抓取」按钮"}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[180px]">发现时间</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow
                  key={page.id}
                  className={page.isRead ? "opacity-60" : ""}
                >
                  <TableCell>
                    {page.isRead ? (
                      <span className="text-muted-foreground">✓</span>
                    ) : (
                      <span className="text-blue-500">●</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[600px]">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline text-sm"
                        onClick={() => {
                          if (!page.isRead) toggleRead(page);
                        }}
                      >
                        {page.title || page.url}
                      </a>
                      <p className="text-xs text-muted-foreground truncate">
                        {page.url}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(page.discoveredAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleRead(page)}
                    >
                      {page.isRead ? "未读" : "已读"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
