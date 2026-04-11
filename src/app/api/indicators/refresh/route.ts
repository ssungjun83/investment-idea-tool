import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { indicators, indicatorSnapshots, ideas, stage1Idea } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { fetchNewsForIndicator } from "@/lib/indicators/news";
import { analyzeIndicator, buildUserContext } from "@/lib/indicators/analyze";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Pro: 최대 60초

/**
 * POST /api/indicators/refresh
 * body: { indicator_id?: number }  — 특정 지표만 새로고침, 없으면 전체
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetId = body.indicator_id as number | undefined;

    // 갱신 대상 지표 조회
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

    // 사용자 투자 아이디어 컨텍스트 로드 (최근 20개)
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
    const results: { indicator: string; status: string }[] = [];

    for (const ind of targetIndicators) {
      try {
        // 1. 뉴스 검색
        const queries = (ind.search_queries as string[]) ?? [];
        const news = await fetchNewsForIndicator(queries, 8);

        // 2. 사용자 컨텍스트 구성
        const userContext = buildUserContext(ind.name, recentIdeas as any);

        // 3. AI 분석
        const analysis = await analyzeIndicator(ind.name, news, userContext);

        // 4. DB 저장 (upsert: 같은 날짜면 업데이트)
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
              news_items: news,
              user_ideas_context: userContext,
            },
          });

        results.push({ indicator: ind.name, status: "success" });
      } catch (err) {
        console.error(`[refresh] ${ind.name} error:`, err);
        results.push({ indicator: ind.name, status: "error" });
      }
    }

    return NextResponse.json({
      refreshed: results.length,
      date: today,
      results,
    });
  } catch (err) {
    console.error("[indicators/refresh] error:", err);
    return NextResponse.json({ error: "갱신 실패" }, { status: 500 });
  }
}
