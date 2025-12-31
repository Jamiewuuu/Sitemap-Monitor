"use client";

import { useState } from "react";
import { Star, Clock, ImageIcon, Video, Music, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

type ContentType = "all" | "video" | "image" | "audio";

interface GeneratedItem {
  id: string;
  type: "video" | "image" | "audio";
  thumbnail?: string;
  title: string;
  createdAt: Date;
  isFavorite: boolean;
  status: "completed" | "in_progress" | "failed";
}

interface GenerationResultsPanelProps {
  items?: GeneratedItem[];
}

export function GenerationResultsPanel({
  items = [],
}: GenerationResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<ContentType>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showInProgress, setShowInProgress] = useState(false);

  const filteredItems = items.filter((item) => {
    if (activeTab !== "all" && item.type !== activeTab) return false;
    if (showFavorites && !item.isFavorite) return false;
    if (showInProgress && item.status !== "in_progress") return false;
    return true;
  });

  const tabItems = [
    { id: "all" as const, label: "All", icon: Layers },
    { id: "video" as const, label: "Video", icon: Video },
    { id: "image" as const, label: "Image", icon: ImageIcon },
    { id: "audio" as const, label: "Audio", icon: Music },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[var(--rm-bg-primary)]">
      {/* Tabs and Filters */}
      <div className="px-6 py-4 border-b border-[var(--rm-border)]">
        <div className="flex items-center justify-between">
          {/* Content Type Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ContentType)}
          >
            <TabsList className="bg-[var(--rm-bg-tertiary)] p-1 h-auto">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "px-4 py-2 text-sm data-[state=active]:bg-[var(--rm-bg-secondary)] data-[state=active]:text-[var(--rm-text-primary)] data-[state=inactive]:text-[var(--rm-text-muted)]"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={showFavorites}
                onCheckedChange={(checked) =>
                  setShowFavorites(checked as boolean)
                }
                className="border-[var(--rm-border)] data-[state=checked]:bg-[var(--rm-purple-start)] data-[state=checked]:border-[var(--rm-purple-start)]"
              />
              <span className="text-[var(--rm-text-muted)] text-sm group-hover:text-[var(--rm-text-secondary)] flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                My Favorites
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={showInProgress}
                onCheckedChange={(checked) =>
                  setShowInProgress(checked as boolean)
                }
                className="border-[var(--rm-border)] data-[state=checked]:bg-[var(--rm-purple-start)] data-[state=checked]:border-[var(--rm-purple-start)]"
              />
              <span className="text-[var(--rm-text-muted)] text-sm group-hover:text-[var(--rm-text-secondary)] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                In Progress
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <GeneratedItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-32 h-24 bg-[var(--rm-bg-tertiary)] rounded-lg relative overflow-hidden">
          {/* Stylized illustration of files/media */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-20 bg-[var(--rm-bg-secondary)] rounded border border-[var(--rm-border)] transform -rotate-6 absolute left-4" />
            <div className="w-16 h-20 bg-[var(--rm-bg-secondary)] rounded border border-[var(--rm-border)] transform rotate-6 absolute right-4" />
            <div className="w-16 h-20 bg-[var(--rm-bg-secondary)] rounded border border-[var(--rm-border)] relative z-10 flex items-center justify-center">
              <Video className="w-6 h-6 text-[var(--rm-text-muted)]" />
            </div>
          </div>
        </div>
        {/* Sparkle decorations */}
        <div className="absolute -top-2 -right-2 w-4 h-4 text-[var(--rm-purple-start)]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -left-3 w-3 h-3 text-[var(--rm-purple-end)]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </div>

      <p className="text-[var(--rm-text-secondary)] text-base">
        Go to generate your creativity
      </p>
    </div>
  );
}

function GeneratedItemCard({ item }: { item: GeneratedItem }) {
  const typeIcon = {
    video: Video,
    image: ImageIcon,
    audio: Music,
  };
  const Icon = typeIcon[item.type];

  return (
    <div className="group relative bg-[var(--rm-bg-secondary)] rounded-xl overflow-hidden border border-[var(--rm-border)] hover:border-[var(--rm-border-hover)] transition-all cursor-pointer">
      {/* Thumbnail */}
      <div className="aspect-video bg-[var(--rm-bg-tertiary)] flex items-center justify-center">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-8 h-8 text-[var(--rm-text-muted)]" />
        )}

        {/* Status indicator */}
        {item.status === "in_progress" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--rm-purple-start)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[var(--rm-text-primary)] text-sm truncate">
            {item.title}
          </span>
          {item.isFavorite && (
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
