import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { crushedScans, type CrushedSector, type CrushedStock } from "@/lib/db/schema";
import { SECTOR_WATCHLIST, scanSector } from "@/lib/crushed/scanner";
import { analyzeCrushedSector } from "@/lib/crushed/analyze";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const sectors: CrushedSector[] = [];
    let totalStocks = 0;

    for (const sectorDef of SECTOR_WATCHLIST) {
      try {
        // 1. Yahoo Finance에서 52주 데이터 스캔
        const { etfQuote, crushedStocks } = await scanSector(sectorDef, 20);

        if (crushedStocks.length === 0) continue;

        // 2. AI 분석
        const analysis = await analyzeCrushedSector(
          `${sectorDef.sector} (${sectorDef.sector_en})`,
          crushedStocks
        );

        // 3. 결과 매핑
        const stocks: CrushedStock[] = crushedStocks.map((s) => {
          const aiStock = analysis.stocks.find((a) => a.ticker === s.ticker);
          return {
            ticker: s.ticker,
            name: s.name,
            exchange: s.exchange,
            current_price: s.current_price,
            week52_low: s.week52_low,
            week52_high: s.week52_high,
            off_from_high_pct: s.off_from_high_pct,
            near_low_pct: s.near_low_pct,
            volume: s.volume,
            market_cap: s.market_cap,
            ai_comment: aiStock?.comment ?? "",
            recovery_potential: aiStock?.recovery_potential ?? "보통",
          };
        });

        sectors.push({
          sector: sectorDef.sector,
          sector_en: sectorDef.sector_en,
          etf_ticker: sectorDef.etf,
          etf_price: etfQuote?.current_price ?? null,
          etf_off_high_pct: etfQuote?.off_from_high_pct ?? null,
          stocks,
          ai_summary: analysis.sector_summary,
        });

        totalStocks += stocks.length;
      } catch (err) {
        console.error(`[crushed] ${sectorDef.sector} error:`, err);
      }
    }

    // 섹터 ETF 하락률 큰 순으로 정렬
    sectors.sort((a, b) => (b.etf_off_high_pct ?? 0) - (a.etf_off_high_pct ?? 0));

    // DB 저장 (upsert)
    await db
      .insert(crushedScans)
      .values({ date: today, sectors, total_stocks: totalStocks })
      .onConflictDoUpdate({
        target: [crushedScans.date],
        set: { sectors, total_stocks: totalStocks },
      });

    return NextResponse.json({
      date: today,
      sectors_found: sectors.length,
      total_stocks: totalStocks,
    });
  } catch (err) {
    console.error("[crushed/refresh] error:", err);
    return NextResponse.json({ error: "스캔 실패" }, { status: 500 });
  }
}
