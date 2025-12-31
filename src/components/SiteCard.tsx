"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Site } from "@/types";
import Link from "next/link";

interface SiteCardProps {
  site: Site;
  onCrawl: (site: Site) => void;
  onDelete: (id: string) => void;
}

const intervalLabels: Record<string, string> = {
  "12h": "每 12 小时",
  "1d": "每天",
  "1w": "每周",
};

export function SiteCard({ site, onCrawl, onDelete }: SiteCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "从未抓取";
    return new Date(date).toLocaleString("zh-CN");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{site.name}</h3>
              <Badge variant={site.status === "active" ? "default" : "destructive"}>
                {site.status === "active" ? "正常" : "异常"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{site.domain}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{intervalLabels[site.crawlInterval] || site.crawlInterval}</span>
              <span>上次抓取: {formatDate(site.lastCrawledAt)}</span>
              {site._count && <span>页面数: {site._count.pages}</span>}
            </div>
            {site.errorMessage && (
              <p className="text-xs text-destructive mt-2">{site.errorMessage}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onCrawl(site)}>
              抓取
            </Button>
            <Link href={`/sites/${site.id}/edit`}>
              <Button size="sm" variant="outline">
                编辑
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => {
                if (confirm(`确定要删除 ${site.name} 吗？这将同时删除所有相关页面数据。`)) {
                  onDelete(site.id);
                }
              }}
            >
              删除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
