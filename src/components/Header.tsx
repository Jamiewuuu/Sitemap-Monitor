"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-background h-14 flex items-center px-4">
      <Link href="/" className="font-bold text-lg">
        Sitemap Monitor
      </Link>
    </header>
  );
}
