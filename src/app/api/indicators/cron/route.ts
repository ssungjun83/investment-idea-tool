import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { indicators, indicatorSnapshots, ideas, stage1Idea } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchNewsForIndicator } from "@/lib/indicators/news";
import { analyzeIndicator, buildUserContext } from "@/lib/indicators/analyze";
import { fetchYahooPrice } from "@/lib/indicators/price";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5분 (Vercel Pro)

/**
 * GET /api/indicators/cron — Vercel Cron Job (매일 07:00 KST)
 * 모든 활성 지표를 순차적으로 갱신
 */
export async function GET(req: NextRequest) {
  // Vercel cron 인증 (선택)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activeIndicators = await db
      .select()
      .from(indicators)
      .where(eq(indicators.is_active, 1))
      .orderBy(indicators.sort_order);

    const recentIdeas = await db
      .select({
        title: ideas.title,
        theme: stage1Idea.theme,
        background: stage1Idea.background,
      })
      .from(ideas)
      .leftJoin(stage1Idea, eq(stage1Idea.idea_id, ideas.id))
      .orderBy(desc(ideas.created_at))
      .limit(20);

    const today = new Date().toISOString().split("T")[0];
    let success = 0;
    let errors = 0;

    for (const ind of activeIndicators) {
      try {
        let priceData = null;
        if (ind.yahoo_symbol) {
          priceData = await fetchYahooPrice(ind.yahoo_symbol);
        }

        const queries = (ind.search_queries as string[]) ?? [];
        const news = await fetchNewsForIndicator(queries, 8);
        const userContext = buildUserContext(ind.name, recentIdeas as any);
        const analysis = await analyzeIndicator(
          ind.name, news, userContext,
          priceData ? `현재 가격: ${priceData.current} ${ind.value_unit ?? ""} (전일대비 ${priceData.change > 0 ? "+" : ""}${priceData.change}, ${priceData.changePct > 0 ? "+" : ""}${priceData.changePct}%)` : null
        );

        await db
          .insert(indicatorSnapshots)
          .values({
            indicator_id: ind.id,
            date: today,
            direction: analysis.direction,
            sentiment_score: analysis.sentiment_score,
            summary: analysis.summary,
            forecast: analysis.forecast,
            forecast_confidence: analysis.forecast_confidence,
            current_value: priceData?.current ?? null,
            previous_close: priceData?.previousClose ?? null,
            value_change: priceData?.change ?? null,
            value_change_pct: priceData?.changePct ?? null,
            day_high: priceData?.dayHigh ?? null,
            day_low: priceData?.dayLow ?? null,
            news_items: news,
            user_ideas_context: userContext,
          })
          .onConflictDoUpdate({
            target: [indicatorSnapshots.indicator_id, indicatorSnapshots.date],
            set: {
              direction: analysis.direction,
              sentiment_score: analysis.sentiment_score,
              summary: analysis.summary,
              forecast: analysis.forecast,
              forecast_confidence: analysis.forecast_confidence,
              current_value: priceData?.current ?? null,
              previous_close: priceData?.previousClose ?? null,
              value_change: priceData?.change ?? null,
              value_change_pct: priceData?.changePct ?? null,
              day_high: priceData?.dayHigh ?? null,
              day_low: priceData?.dayLow ?? null,
              news_items: news,
              user_ideas_context: userContext,
            },
          });

        success++;
      } catch (err) {
        console.error(`[cron] ${ind.name} error:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      date: today,
      total: activeIndicators.length,
      success,
      errors,
    });
  } catch (err) {
    console.error("[cron] error:", err);
    return NextResponse.json({ error: "Cron 실행 실패" }, { status: 500 });
  }
}
