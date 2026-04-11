/**
 * Yahoo Finance API를 이용한 실시간 가격 조회
 */

export interface PriceData {
  current: number;
  previousClose: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  currency: string;
}

/**
 * Yahoo Finance에서 현재 가격 조회
 */
export async function fetchYahooPrice(symbol: string): Promise<PriceData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const current = meta.regularMarketPrice ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? current;
    const change = current - previousClose;
    const changePct = previousClose !== 0 ? (change / previousClose) * 100 : 0;
    const dayHigh = meta.regularMarketDayHigh ?? current;
    const dayLow = meta.regularMarketDayLow ?? current;

    return {
      current: Math.round(current * 100) / 100,
      previousClose: Math.round(previousClose * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      dayHigh: Math.round(dayHigh * 100) / 100,
      dayLow: Math.round(dayLow * 100) / 100,
      currency: meta.currency ?? "USD",
    };
  } catch (err) {
    console.error(`[yahoo] ${symbol} fetch error:`, err);
    return null;
  }
}

/**
 * Yahoo Finance에서 과거 가격 히스토리 조회 (차트용)
 */
export async function fetchYahooPriceHistory(
  symbol: string,
  range = "3mo"
): Promise<{ date: string; close: number }[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];

    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        close: Math.round((closes[i] ?? 0) * 100) / 100,
      }))
      .filter((d) => d.close > 0);
  } catch (err) {
    console.error(`[yahoo] ${symbol} history error:`, err);
    return [];
  }
}
