import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { stage3Companies, ideas } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 기업별 집계: 언급 횟수, 평균 확신도, 관련 아이디어
    const rows = await db
      .select({
        company_name: stage3Companies.company_name,
        ticker: stage3Companies.ticker,
        exchange: stage3Companies.exchange,
        sector: stage3Companies.sector,
        mention_count: sql<number>`count(DISTINCT ${stage3Companies.idea_id})::int`,
        avg_confidence: sql<number>`AVG(CASE ${stage3Companies.confidence} WHEN '높음' THEN 3 WHEN '보통' THEN 2 WHEN '낮음' THEN 1 END)`,
        benefit_types: sql<string>`string_agg(DISTINCT ${stage3Companies.benefit_type}, ', ')`,
        idea_ids: sql<number[]>`array_agg(DISTINCT ${stage3Companies.idea_id})`,
      })
      .from(stage3Companies)
      .groupBy(
        stage3Companies.company_name,
        stage3Companies.ticker,
        stage3Companies.exchange,
        stage3Companies.sector
      )
      .orderBy(desc(sql`count(DISTINCT ${stage3Companies.idea_id})`));

    // 각 기업의 관련 아이디어 제목 가져오기
    const result = await Promise.all(
      rows.map(async (row) => {
        const ideaIds = row.idea_ids ?? [];
        const ideaTitles =
          ideaIds.length > 0
            ? await Promise.all(
                ideaIds.map(async (id) => {
                  const [idea] = await db
                    .select({ id: ideas.id, title: ideas.title })
                    .from(ideas)
                    .where(eq(ideas.id, id))
                    .limit(1);
                  return idea ? { id: idea.id, title: idea.title } : null;
                })
              )
            : [];

        return {
          company_name: row.company_name,
          ticker: row.ticker,
          exchange: row.exchange,
          sector: row.sector,
          mention_count: row.mention_count,
          avg_confidence: Math.round((row.avg_confidence ?? 0) * 10) / 10,
          confidence_label:
            (row.avg_confidence ?? 0) >= 2.5 ? "높음" : (row.avg_confidence ?? 0) >= 1.5 ? "보통" : "낮음",
          benefit_types: row.benefit_types,
          ideas: ideaTitles.filter(Boolean),
        };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[companies] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
