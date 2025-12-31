"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CrawlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteName: string;
  siteId: string;
  onCrawl: (siteId: string, dateRange: string) => Promise<void>;
}

export function CrawlDialog({
  open,
  onOpenChange,
  siteName,
  siteId,
  onCrawl,
}: CrawlDialogProps) {
  const [dateRange, setDateRange] = useState("1w");
  const [loading, setLoading] = useState(false);

  const handleCrawl = async () => {
    setLoading(true);
    try {
      await onCrawl(siteId, dateRange);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>抓取 - {siteName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">选择时间范围:</p>
          <RadioGroup value={dateRange} onValueChange={setDateRange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1d" id="1d" />
              <Label htmlFor="1d">最近 1 天</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1w" id="1w" />
              <Label htmlFor="1w">最近 1 周</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2w" id="2w" />
              <Label htmlFor="2w">最近 2 周</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1m" id="1m" />
              <Label htmlFor="1m">最近 1 个月</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCrawl} disabled={loading}>
            {loading ? "抓取中..." : "开始抓取"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
