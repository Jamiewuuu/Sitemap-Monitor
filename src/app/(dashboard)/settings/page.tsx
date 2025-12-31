"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [cx, setCx] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setApiKey(data.google_api_key || "");
        setCx(data.google_cx || "");
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_api_key: apiKey,
          google_cx: cx,
        }),
      });

      if (!res.ok) {
        throw new Error("保存失败");
      }

      toast.success("设置已保存");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("保存失败");
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
    <div className="container mx-auto px-4 py-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">设置</h1>

      <Card>
        <CardHeader>
          <CardTitle>Google Custom Search API</CardTitle>
          <CardDescription>
            配置 Google Custom Search API 用于抓取竞品网站页面
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                在{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google Cloud Console
                </a>{" "}
                创建 API Key
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cx">Search Engine ID (cx)</Label>
              <Input
                id="cx"
                placeholder="例如：017576662512468239146:omuauf_gy1o"
                value={cx}
                onChange={(e) => setCx(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                在{" "}
                <a
                  href="https://programmablesearchengine.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Programmable Search Engine
                </a>{" "}
                创建搜索引擎并获取 ID
              </p>
            </div>

            <Button type="submit" disabled={loading} className="mt-4">
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. 访问 Google Cloud Console 创建项目并启用 Custom Search API</p>
          <p>2. 在「凭据」页面创建 API Key</p>
          <p>3. 访问 Programmable Search Engine 创建搜索引擎</p>
          <p>4. 选择「搜索整个网络」选项</p>
          <p>5. 复制 Search Engine ID 到上方配置</p>
          <p className="pt-2 text-yellow-600">
            注意：免费版每天限 100 次查询，付费版 $5/1000 次
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
