import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { indicators, indicatorSnapshots } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchYahooPriceHistory } from "@/lib/indicators/price";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allIndicators = await db
      .select()
      .from(indicators)
      .where(eq(indicators.is_active, 1))
      .orderBy(indicators.sort_order);

    const result = await Promise.all(
      allIndicators.map(async (ind) => {
        // 최근 30일 스냅샷
        const snapshots = await db
          .select({
            id: indicatorSnapshots.id,
            date: indicatorSnapshots.date,
            direction: indicatorSnapshots.direction,
            sentiment_score: indicatorSnapshots.sentiment_score,
            summary: indicatorSnapshots.summary,
            forecast: indicatorSnapshots.forecast,
            forecast_confidence: indicatorSnapshots.forecast_confidence,
            current_value: indicatorSnapshots.current_value,
            previous_close: indicatorSnapshots.previous_close,
            value_change: indicatorSnapshots.value_change,
            value_change_pct: indicatorSnapshots.value_change_pct,
            day_high: indicatorSnapshots.day_high,
            day_low: indicatorSnapshots.day_low,
            news_items: indicatorSnapshots.news_items,
            user_ideas_context: indicatorSnapshots.user_ideas_context,
          })
          .from(indicatorSnapshots)
          .where(eq(indicatorSnapshots.indicator_id, ind.id))
          .orderBy(desc(indicatorSnapshots.date))
          .limit(30);

        const latest = snapshots[0] ?? null;

        // Yahoo Finance 가격 히스토리 (차트용)
        let priceHistory: { date: string; close: number }[] = [];
        if (ind.yahoo_symbol) {
          priceHistory = await fetchYahooPriceHistory(ind.yahoo_symbol, "3mo");
        }

        return {
          id: ind.id,
          name: ind.name,
          name_en: ind.name_en,
          category: ind.category,
          description: ind.description,
          yahoo_symbol: ind.yahoo_symbol,
          value_unit: ind.value_unit,
          latest,
          history: snapshots.reverse(),
          priceHistory,
        };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[indicators] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
