"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Site } from "@/types";

export default function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [crawlInterval, setCrawlInterval] = useState("1d");

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await fetch(`/api/sites/${id}`);
        const site: Site = await res.json();
        setName(site.name);
        setDomain(site.domain);
        setCrawlInterval(site.crawlInterval);
      } catch (error) {
        console.error("Error fetching site:", error);
        toast.error("获取网站信息失败");
      } finally {
        setFetching(false);
      }
    };
    fetchSite();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !domain.trim()) {
      toast.error("请填写网站名称和域名");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, crawlInterval }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "更新失败");
      }

      toast.success("更新成功");
      router.push("/sites");
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error(error instanceof Error ? error.message : "更新失败");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-8 text-muted-foreground">加载中...</div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>编辑网站</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">网站名称</Label>
              <Input
                id="name"
                placeholder="例如：竞品A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">域名</Label>
              <Input
                id="domain"
                placeholder="例如：example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">监控频率</Label>
              <Select value={crawlInterval} onValueChange={setCrawlInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">每 12 小时</SelectItem>
                  <SelectItem value="1d">每天</SelectItem>
                  <SelectItem value="1w">每周</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
