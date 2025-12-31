export interface SearchResult {
  title: string;
  link: string;
}

export interface GoogleSearchResponse {
  items?: {
    title: string;
    link: string;
  }[];
  searchInformation?: {
    totalResults: string;
  };
  error?: {
    message: string;
  };
}

// 计算日期范围
function getDateAfter(range: string): string {
  const now = new Date();
  let daysAgo = 7; // 默认一周

  switch (range) {
    case "1d":
      daysAgo = 1;
      break;
    case "1w":
      daysAgo = 7;
      break;
    case "2w":
      daysAgo = 14;
      break;
    case "1m":
      daysAgo = 30;
      break;
  }

  const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return targetDate.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function searchGoogleForSite(
  domain: string,
  dateRange: string = "1w",
  apiKey?: string,
  cx?: string
): Promise<SearchResult[]> {
  const key = apiKey || process.env.GOOGLE_API_KEY;
  const searchEngineId = cx || process.env.GOOGLE_CX;

  if (!key || !searchEngineId) {
    throw new Error("Google API Key 或 Search Engine ID 未配置");
  }

  const dateAfter = getDateAfter(dateRange);
  const query = `site:${domain} after:${dateAfter}`;

  const results: SearchResult[] = [];
  let start = 1;
  const maxResults = 100; // Google API 最多返回 100 条

  while (start <= maxResults) {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", key);
    url.searchParams.set("cx", searchEngineId);
    url.searchParams.set("q", query);
    url.searchParams.set("num", "10");
    url.searchParams.set("start", start.toString());

    try {
      const response = await fetch(url.toString());
      const data: GoogleSearchResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.items || data.items.length === 0) {
        break; // 没有更多结果
      }

      for (const item of data.items) {
        results.push({
          title: item.title,
          link: item.link,
        });
      }

      // 如果返回的结果少于 10 条，说明没有更多了
      if (data.items.length < 10) {
        break;
      }

      start += 10;
    } catch (error) {
      console.error("Google Search API error:", error);
      throw error;
    }
  }

  return results;
}
