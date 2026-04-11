import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { indicators, indicatorSnapshots, ideas, stage1Idea } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchNewsForIndicator } from "@/lib/indicators/news";
import { analyzeIndicator, buildUserContext } from "@/lib/indicators/analyze";
import { fetchYahooPrice } from "@/lib/indicators/price";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/indicators/refresh
 * body: { indicator_id?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetId = body.indicator_id as number | undefined;

    let targetIndicators;
    if (targetId) {
      targetIndicators = await db
        .select()
        .from(indicators)
        .where(eq(indicators.id, targetId));
    } else {
      targetIndicators = await db
        .select()
        .from(indicators)
        .where(eq(indicators.is_active, 1))
        .orderBy(indicators.sort_order);
    }

    if (targetIndicators.length === 0) {
      return NextResponse.json({ error: "지표를 찾을 수 없습니다" }, { status: 404 });
    }

    // 사용자 투자 아이디어 컨텍스트 로드
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
    const results: { indicator: string; status: string; price?: number }[] = [];

    for (const ind of targetIndicators) {
      try {
        // 1. Yahoo Finance에서 실제 가격 조회
        let priceData = null;
        if (ind.yahoo_symbol) {
          priceData = await fetchYahooPrice(ind.yahoo_symbol);
        }

        // 2. 뉴스 검색
        const queries = (ind.search_queries as string[]) ?? [];
        const news = await fetchNewsForIndicator(queries, 8);

        // 3. 사용자 컨텍스트 구성
        const userContext = buildUserContext(ind.name, recentIdeas as any);

        // 4. AI 분석 (실제 가격 정보 포함)
        const analysis = await analyzeIndicator(
          ind.name,
          news,
          userContext,
          priceData
            ? `현재 가격: ${priceData.current} ${ind.value_unit ?? ""} (전일대비 ${priceData.change > 0 ? "+" : ""}${priceData.change}, ${priceData.changePct > 0 ? "+" : ""}${priceData.changePct}%)`
            : null
        );

        // 5. DB 저장
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

        results.push({
          indicator: ind.name,
          status: "success",
          price: priceData?.current ?? undefined,
        });
      } catch (err) {
        console.error(`[refresh] ${ind.name} error:`, err);
        results.push({ indicator: ind.name, status: "error" });
      }
    }

    return NextResponse.json({ refreshed: results.length, date: today, results });
  } catch (err) {
    console.error("[indicators/refresh] error:", err);
    return NextResponse.json({ error: "갱신 실패" }, { status: 500 });
  }
}
