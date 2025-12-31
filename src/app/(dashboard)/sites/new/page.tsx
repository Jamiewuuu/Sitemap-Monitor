"use client";

import { useState } from "react";
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

export default function NewSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [crawlInterval, setCrawlInterval] = useState("1d");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !domain.trim()) {
      toast.error("请填写网站名称和域名");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, crawlInterval }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "添加失败");
      }

      toast.success("添加成功");
      router.push("/");
    } catch (error) {
      console.error("Error creating site:", error);
      toast.error(error instanceof Error ? error.message : "添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>添加网站</CardTitle>
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
              <p className="text-xs text-muted-foreground">
                无需输入 http:// 或 https://
              </p>
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
                onClick={() => router.push("/")}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "添加中..." : "添加"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
