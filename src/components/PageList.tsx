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

interface PageListProps {
  initialSiteId?: string;
}

export function PageList({ initialSiteId }: PageListProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // 筛选条件
  const [siteId, setSiteId] = useState(initialSiteId || "all");
  const [readStatus, setReadStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (siteId && siteId !== "all") params.set("siteId", siteId);
      if (readStatus === "unread") params.set("isRead", "false");
      if (readStatus === "read") params.set("isRead", "true");
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
  }, [siteId, readStatus, search]);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data || []);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

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
      const params = siteId && siteId !== "all" ? `?siteId=${siteId}` : "";
      await fetch(`/api/pages/read-all${params}`, { method: "PUT" });
      fetchPages();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("zh-CN");
  };

  return (
    <div className="space-y-4">
      {/* 统计信息 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>共 {total} 个页面</span>
        {unreadCount > 0 && (
          <Badge variant="secondary">{unreadCount} 未读</Badge>
        )}
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4">
        <Select value={siteId} onValueChange={setSiteId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="所有网站" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有网站</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={readStatus} onValueChange={setReadStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="所有状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="unread">未读</SelectItem>
            <SelectItem value="read">已读</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="搜索标题或 URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[250px]"
        />

        <div className="flex-1" />

        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          全部标记已读
        </Button>
      </div>

      {/* 页面表格 */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无页面数据
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">状态</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>网站</TableHead>
              <TableHead className="w-[180px]">发现时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id} className={page.isRead ? "opacity-60" : ""}>
                <TableCell>
                  {page.isRead ? (
                    <span className="text-muted-foreground">✓</span>
                  ) : (
                    <span className="text-primary">●</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                      onClick={() => {
                        if (!page.isRead) toggleRead(page);
                      }}
                    >
                      {page.title}
                    </a>
                    <p className="text-xs text-muted-foreground truncate max-w-[400px]">
                      {page.url}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{page.site?.name || "-"}</span>
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
                    {page.isRead ? "标记未读" : "标记已读"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
