"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageTable } from "@/components/PageTable";
import { Site } from "@/types";

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data || []);
      // 默认选中第一个网站
      if (data.length > 0 && !selectedSiteId) {
        setSelectedSiteId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* 左侧边栏 - 网站列表 */}
      <Sidebar
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
        onRefresh={fetchSites}
        loading={loading}
      />

      {/* 右侧 - 页面列表 */}
      <div className="flex-1 overflow-auto">
        {selectedSite ? (
          <PageTable site={selectedSite} onSiteUpdate={fetchSites} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {loading ? "加载中..." : "请选择一个网站或添加新网站"}
          </div>
        )}
      </div>
    </div>
  );
}
