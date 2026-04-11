/**
 * Google News RSS 기반 뉴스 검색 유틸리티
 */

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Google News RSS에서 뉴스 기사 검색
 */
export async function fetchGoogleNews(
  query: string,
  maxResults = 5
): Promise<NewsItem[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ko&gl=KR&ceid=KR:ko`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items: NewsItem[] = [];

    // Simple XML parsing for RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < maxResults) {
      const itemXml = match[1];

      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      if (titleMatch) {
        items.push({
          title: decodeHTMLEntities(titleMatch[1].trim()),
          source: sourceMatch ? decodeHTMLEntities(sourceMatch[1].trim()) : "Google News",
          url: linkMatch ? linkMatch[1].trim() : "",
          date: pubDateMatch
            ? new Date(pubDateMatch[1].trim()).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      }
    }

    return items;
  } catch (err) {
    console.error(`[news] fetch error for "${query}":`, err);
    return [];
  }
}

/**
 * 여러 검색어로 뉴스 검색 후 중복 제거 + 합치기
 */
export async function fetchNewsForIndicator(
  queries: string[],
  maxTotal = 10
): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  for (const q of queries) {
    const items = await fetchGoogleNews(q, 5);
    allItems.push(...items);
  }

  // 중복 제거 (제목 유사도 기반)
  const unique: NewsItem[] = [];
  const seenTitles = new Set<string>();

  for (const item of allItems) {
    const normalized = item.title.toLowerCase().replace(/\s+/g, "").slice(0, 30);
    if (!seenTitles.has(normalized)) {
      seenTitles.add(normalized);
      unique.push(item);
    }
  }

  // 최신순 정렬
  unique.sort((a, b) => b.date.localeCompare(a.date));

  return unique.slice(0, maxTotal);
}
