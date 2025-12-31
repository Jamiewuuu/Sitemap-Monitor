"use client";

import { useState } from "react";
import {
  Home,
  FolderOpen,
  Star,
  History,
  User,
  Settings,
  MoreHorizontal,
  Zap,
  Gift,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home" },
  { icon: FolderOpen, label: "Projects" },
  { icon: Star, label: "Favorites" },
  { icon: History, label: "History" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" },
  { icon: MoreHorizontal, label: "More" },
];

function IconSidebar() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-14 bg-[var(--rm-bg-secondary)] border-r border-[var(--rm-border)] flex flex-col items-center py-4">
      {/* Navigation Icons */}
      <div className="flex flex-col items-center gap-1">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
              activeIndex === index
                ? "bg-[var(--rm-purple-start)] text-white"
                : "text-[var(--rm-text-muted)] hover:text-[var(--rm-text-secondary)] hover:bg-[var(--rm-bg-tertiary)]"
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Expand Button */}
      <div className="mt-auto">
        <button
          className="flex items-center justify-center py-2 text-[var(--rm-text-muted)] hover:text-[var(--rm-text-secondary)] transition-colors"
          title="Expand sidebar"
        >
          <span
            className="text-[10px] font-medium tracking-wider"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Expand
          </span>
        </button>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <header className="h-14 bg-[var(--rm-bg-secondary)] border-b border-[var(--rm-border)] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--rm-purple-start)] to-[var(--rm-purple-end)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="text-[var(--rm-text-primary)] font-semibold text-lg">
          ReelMate AI
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-[var(--rm-text-secondary)] hover:text-[var(--rm-text-primary)] hover:bg-[var(--rm-bg-tertiary)] gap-2"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>0</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--rm-text-secondary)] hover:text-[var(--rm-text-primary)] hover:bg-[var(--rm-bg-tertiary)]"
        >
          <Gift className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--rm-text-secondary)] hover:text-[var(--rm-text-primary)] hover:bg-[var(--rm-bg-tertiary)]"
        >
          <Bell className="w-5 h-5" />
        </Button>

        <Button
          size="sm"
          className="bg-gradient-to-r from-[var(--rm-purple-start)] to-[var(--rm-purple-end)] text-white hover:opacity-90"
        >
          Log In
        </Button>
      </div>
    </header>
  );
}

export default function ReelMateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="reelmate-theme min-h-screen bg-[var(--rm-bg-primary)] flex">
      <IconSidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
