import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { indicators, indicatorSnapshots } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 모든 활성 지표 + 최근 스냅샷들
    const allIndicators = await db
      .select()
      .from(indicators)
      .where(eq(indicators.is_active, 1))
      .orderBy(indicators.sort_order);

    const result = await Promise.all(
      allIndicators.map(async (ind) => {
        // 최근 30일 스냅샷 (차트용)
        const snapshots = await db
          .select({
            id: indicatorSnapshots.id,
            date: indicatorSnapshots.date,
            direction: indicatorSnapshots.direction,
            sentiment_score: indicatorSnapshots.sentiment_score,
            summary: indicatorSnapshots.summary,
            forecast: indicatorSnapshots.forecast,
            forecast_confidence: indicatorSnapshots.forecast_confidence,
            news_items: indicatorSnapshots.news_items,
            user_ideas_context: indicatorSnapshots.user_ideas_context,
          })
          .from(indicatorSnapshots)
          .where(eq(indicatorSnapshots.indicator_id, ind.id))
          .orderBy(desc(indicatorSnapshots.date))
          .limit(30);

        const latest = snapshots[0] ?? null;

        return {
          id: ind.id,
          name: ind.name,
          name_en: ind.name_en,
          category: ind.category,
          description: ind.description,
          latest,
          history: snapshots.reverse(), // 오래된 것 먼저 (차트용)
        };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[indicators] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
