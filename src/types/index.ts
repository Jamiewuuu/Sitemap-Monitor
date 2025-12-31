export interface Site {
  id: string;
  name: string;
  domain: string;
  crawlInterval: string;
  lastCrawledAt: Date | null;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    pages: number;
  };
}

export interface Page {
  id: string;
  siteId: string;
  url: string;
  title: string;
  discoveredAt: Date;
  isRead: boolean;
  createdAt: Date;
  site?: Site;
}

export interface CrawlRequest {
  siteId: string;
  dateRange: "1d" | "1w" | "2w" | "1m";
}

export interface CrawlResult {
  success: boolean;
  newPagesCount: number;
  totalFound: number;
  error?: string;
}
