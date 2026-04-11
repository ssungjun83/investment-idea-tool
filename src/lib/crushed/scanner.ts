/**
 * 52주 최저가 근처 종목 스캐너 (Yahoo Finance)
 */

export interface StockQuote {
  ticker: string;
  name: string;
  exchange: string;
  current_price: number;
  week52_low: number;
  week52_high: number;
  off_from_high_pct: number;
  near_low_pct: number;
  volume: number;
  market_cap: number | null;
}

/** 섹터 ETF + 대표 종목 리스트 */
export const SECTOR_WATCHLIST = [
  {
    sector: "에너지",
    sector_en: "Energy",
    etf: "XLE",
    stocks: ["XOM", "CVX", "SLB", "EOG", "MPC", "VLO", "PSX", "OXY", "HAL", "DVN", "FANG", "HES"],
  },
  {
    sector: "금융",
    sector_en: "Financials",
    etf: "XLF",
    stocks: ["JPM", "BAC", "WFC", "GS", "MS", "C", "BLK", "SCHW", "AXP", "USB"],
  },
  {
    sector: "기술",
    sector_en: "Technology",
    etf: "XLK",
    stocks: ["AAPL", "MSFT", "NVDA", "AVGO", "AMD", "INTC", "CRM", "ADBE", "CSCO", "ORCL", "QCOM", "MU"],
  },
  {
    sector: "헬스케어",
    sector_en: "Healthcare",
    etf: "XLV",
    stocks: ["UNH", "JNJ", "LLY", "PFE", "ABBV", "MRK", "TMO", "ABT", "AMGN", "BMY", "GILD"],
  },
  {
    sector: "산업재",
    sector_en: "Industrials",
    etf: "XLI",
    stocks: ["GE", "CAT", "HON", "UNP", "BA", "RTX", "DE", "LMT", "MMM", "FDX", "EMR"],
  },
  {
    sector: "소비재",
    sector_en: "Consumer Discretionary",
    etf: "XLY",
    stocks: ["AMZN", "TSLA", "HD", "MCD", "NKE", "LOW", "SBUX", "TJX", "BKNG", "CMG"],
  },
  {
    sector: "필수소비재",
    sector_en: "Consumer Staples",
    etf: "XLP",
    stocks: ["PG", "KO", "PEP", "COST", "WMT", "PM", "MO", "CL", "MDLZ", "KHC"],
  },
  {
    sector: "유틸리티",
    sector_en: "Utilities",
    etf: "XLU",
    stocks: ["NEE", "DUK", "SO", "D", "AEP", "SRE", "EXC", "XEL", "WEC", "ED"],
  },
  {
    sector: "소재",
    sector_en: "Materials",
    etf: "XLB",
    stocks: ["LIN", "APD", "SHW", "FCX", "NEM", "NUE", "DOW", "DD", "EMN", "CF"],
  },
  {
    sector: "부동산",
    sector_en: "Real Estate",
    etf: "XLRE",
    stocks: ["PLD", "AMT", "EQIX", "CCI", "PSA", "SPG", "O", "WELL", "DLR", "AVB"],
  },
  {
    sector: "통신",
    sector_en: "Communication Services",
    etf: "XLC",
    stocks: ["META", "GOOGL", "DIS", "NFLX", "CMCSA", "T", "VZ", "TMUS", "EA", "CHTR"],
  },
  {
    sector: "반도체",
    sector_en: "Semiconductors",
    etf: "SOXX",
    stocks: ["NVDA", "AMD", "INTC", "AVGO", "QCOM", "TXN", "MU", "AMAT", "LRCX", "KLAC", "MRVL", "ON"],
  },
  {
    sector: "조선/해운",
    sector_en: "Shipping & Shipbuilding",
    etf: "BOAT",
    stocks: ["ZIM", "GOGL", "SBLK", "DAC", "EGLE", "GNK", "SFL", "STNG", "TNK", "FRO", "INSW", "DHT"],
  },
  {
    sector: "한국 대형주",
    sector_en: "Korea Large Cap",
    etf: "EWY",
    stocks: ["005930.KS", "000660.KS", "035420.KS", "051910.KS", "005380.KS", "006400.KS",
             "035720.KS", "000270.KS", "068270.KS", "028260.KS", "105560.KS", "015760.KS"],
  },
];

/**
 * Yahoo Finance에서 종목의 52주 범위 + 현재가 조회
 */
export async function fetchStockQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const closes: number[] = data.chart.result[0].indicators?.quote?.[0]?.close ?? [];
    const validCloses = closes.filter((c: any) => c != null && c > 0);
    if (validCloses.length === 0) return null;

    const week52_low = Math.min(...validCloses);
    const week52_high = Math.max(...validCloses);
    const current = meta.regularMarketPrice ?? validCloses[validCloses.length - 1];

    if (!current || current <= 0) return null;

    const off_from_high_pct = ((week52_high - current) / week52_high) * 100;
    const near_low_pct = week52_low > 0 ? ((current - week52_low) / week52_low) * 100 : 0;

    return {
      ticker,
      name: meta.shortName ?? meta.symbol ?? ticker,
      exchange: meta.exchangeName ?? meta.fullExchangeName ?? "",
      current_price: Math.round(current * 100) / 100,
      week52_low: Math.round(week52_low * 100) / 100,
      week52_high: Math.round(week52_high * 100) / 100,
      off_from_high_pct: Math.round(off_from_high_pct * 10) / 10,
      near_low_pct: Math.round(near_low_pct * 10) / 10,
      volume: meta.regularMarketVolume ?? 0,
      market_cap: meta.marketCap ?? null,
    };
  } catch (err) {
    console.error(`[scanner] ${ticker} error:`, err);
    return null;
  }
}

/**
 * 섹터 전체 스캔: 52주 고점 대비 20% 이상 하락한 종목 필터
 */
export async function scanSector(
  sectorDef: typeof SECTOR_WATCHLIST[0],
  threshold = 20
): Promise<{ etfQuote: StockQuote | null; crushedStocks: StockQuote[] }> {
  // ETF 먼저
  const etfQuote = await fetchStockQuote(sectorDef.etf);

  // 개별 종목 스캔 (병렬, 3개씩 배치)
  const stocks: StockQuote[] = [];
  const batchSize = 3;
  for (let i = 0; i < sectorDef.stocks.length; i += batchSize) {
    const batch = sectorDef.stocks.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((t) => fetchStockQuote(t)));
    for (const r of results) {
      if (r) stocks.push(r);
    }
  }

  // 52주 고점 대비 threshold% 이상 하락한 종목만
  const crushedStocks = stocks
    .filter((s) => s.off_from_high_pct >= threshold)
    .sort((a, b) => b.off_from_high_pct - a.off_from_high_pct);

  return { etfQuote, crushedStocks };
}
